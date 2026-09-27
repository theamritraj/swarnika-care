package com.swarnikacare.billing.service;

import com.swarnikacare.billing.dto.InvoiceResponse;
import com.swarnikacare.billing.dto.PaymentResponse;
import com.swarnikacare.billing.dto.ReceiptResponse;
import com.swarnikacare.billing.entity.Invoice;
import com.swarnikacare.billing.entity.InvoiceItem;
import com.swarnikacare.billing.entity.InvoiceStatus;
import com.swarnikacare.billing.entity.Payment;
import com.swarnikacare.billing.entity.Receipt;
import com.swarnikacare.billing.repository.InvoiceItemRepository;
import com.swarnikacare.billing.repository.InvoiceRepository;
import com.swarnikacare.billing.repository.PaymentRepository;
import com.swarnikacare.billing.repository.ReceiptRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BillingService {

    private final InvoiceRepository invoiceRepo;
    private final InvoiceItemRepository itemRepo;
    private final PaymentRepository paymentRepo;
    private final ReceiptRepository receiptRepo;

    public BillingService(InvoiceRepository invoiceRepo, InvoiceItemRepository itemRepo,
                          PaymentRepository paymentRepo, ReceiptRepository receiptRepo) {
        this.invoiceRepo = invoiceRepo;
        this.itemRepo = itemRepo;
        this.paymentRepo = paymentRepo;
        this.receiptRepo = receiptRepo;
    }

    // ─── Patient Self-Service (JWT-resolved patientId) ────────────────────────

    /**
     * Get all invoices for a patient. PatientId MUST come from JWT — never from client.
     */
    public List<InvoiceResponse> getMyInvoices(Long patientId) {
        return invoiceRepo.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(inv -> InvoiceResponse.fromEntity(inv, itemRepo.findByInvoiceId(inv.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Get a single invoice. Enforces ownership — patient can only see own invoice.
     */
    public InvoiceResponse getMyInvoiceById(Long patientId, Long invoiceId) {
        Invoice inv = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));
        if (!inv.getPatientId().equals(patientId)) {
            throw new AccessDeniedException("Access denied: invoice does not belong to this patient");
        }
        List<InvoiceItem> items = itemRepo.findByInvoiceId(inv.getId());
        return InvoiceResponse.fromEntity(inv, items);
    }

    /**
     * Get all payments for a patient. PatientId from JWT.
     */
    public List<PaymentResponse> getMyPayments(Long patientId) {
        return paymentRepo.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all receipts for a patient. PatientId from JWT.
     */
    public List<ReceiptResponse> getMyReceipts(Long patientId) {
        return receiptRepo.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(ReceiptResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Dashboard summary for a patient: outstanding amount, recent invoices, paid count.
     */
    public BillingSummary getMySummary(Long patientId) {
        List<Invoice> all = invoiceRepo.findByPatientIdOrderByCreatedAtDesc(patientId);
        BigDecimal outstanding = all.stream()
                .map(Invoice::getOutstandingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long paidCount = all.stream().filter(i -> i.getStatus() == InvoiceStatus.PAID).count();
        long pendingCount = all.stream().filter(i -> i.getStatus() != InvoiceStatus.PAID
                && i.getStatus() != InvoiceStatus.CANCELLED).count();
        return new BillingSummary(outstanding, all.size(), paidCount, pendingCount);
    }

    // ─── Staff / Admin Mutations ──────────────────────────────────────────────

    @Transactional
    public InvoiceResponse createInvoice(Invoice invoice, List<InvoiceItem> items) {
        String num = "INV-" + System.currentTimeMillis();
        invoice.setInvoiceNumber(num);
        invoice.setIssuedAt(LocalDateTime.now());
        invoice.setStatus(InvoiceStatus.ISSUED);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (InvoiceItem item : items) {
            BigDecimal base = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal afterDiscount = base.subtract(item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO);
            BigDecimal tax = afterDiscount.multiply(item.getTaxRate().divide(BigDecimal.valueOf(100)));
            BigDecimal lineTotal = afterDiscount.add(tax);
            item.setLineTotal(lineTotal);
            subtotal = subtotal.add(lineTotal);
        }
        invoice.setSubtotal(subtotal);
        invoice.setTotalAmount(subtotal.add(invoice.getTaxAmount()).subtract(invoice.getDiscountAmount()));
        invoice.setOutstandingAmount(invoice.getTotalAmount());

        Invoice saved = invoiceRepo.save(invoice);
        for (InvoiceItem item : items) {
            item.setInvoiceId(saved.getId());
        }
        List<InvoiceItem> savedItems = itemRepo.saveAll(items);
        return InvoiceResponse.fromEntity(saved, savedItems);
    }

    public record BillingSummary(BigDecimal outstandingAmount, int totalInvoices,
                                 long paidInvoices, long pendingInvoices) {}
}
