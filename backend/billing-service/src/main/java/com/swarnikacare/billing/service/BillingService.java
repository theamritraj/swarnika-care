package com.swarnikacare.billing.service;

import com.swarnikacare.billing.dto.*;
import com.swarnikacare.billing.entity.*;
import com.swarnikacare.billing.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.Duration;
import org.springframework.data.redis.core.RedisTemplate;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
@Transactional(readOnly = true)
public class BillingService {

    private final InvoiceRepository invoiceRepo;
    private final InvoiceItemRepository itemRepo;
    private final PaymentRepository paymentRepo;
    private final ReceiptRepository receiptRepo;
    private final ChargeRepository chargeRepo;
    private final RefundRepository refundRepo;
    private final AdjustmentRepository adjRepo;
    private final RedisTemplate<String, Object> redisTemplate;

    public BillingService(InvoiceRepository invoiceRepo, InvoiceItemRepository itemRepo,
                          PaymentRepository paymentRepo, ReceiptRepository receiptRepo,
                          ChargeRepository chargeRepo, RefundRepository refundRepo,
                          AdjustmentRepository adjRepo, RedisTemplate<String, Object> redisTemplate) {
        this.invoiceRepo = invoiceRepo;
        this.itemRepo = itemRepo;
        this.paymentRepo = paymentRepo;
        this.receiptRepo = receiptRepo;
        this.chargeRepo = chargeRepo;
        this.refundRepo = refundRepo;
        this.adjRepo = adjRepo;
        this.redisTemplate = redisTemplate;
    }

    private void checkIdempotency(String operation, String hashStr) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(hashStr.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * encodedhash.length);
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if(hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            String key = "swarnika:prod:billing:idempotency:" + operation + ":" + hexString.toString();
            Boolean isNew = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSED", Duration.ofMinutes(5));
            if (Boolean.FALSE.equals(isNew)) {
                throw new IllegalStateException("Duplicate " + operation + " request detected. Please wait.");
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {}
    }

    // ─── Patient Self-Service ──────────────────────────────────────────────────

    public List<InvoiceResponse> getMyInvoices(Long patientId) {
        return invoiceRepo.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(inv -> InvoiceResponse.fromEntity(inv, itemRepo.findByInvoiceId(inv.getId())))
                .collect(Collectors.toList());
    }

    public InvoiceResponse getMyInvoiceById(Long patientId, Long invoiceId) {
        Invoice inv = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        if (!inv.getPatientId().equals(patientId)) {
            throw new AccessDeniedException("Access denied");
        }
        return InvoiceResponse.fromEntity(inv, itemRepo.findByInvoiceId(inv.getId()));
    }

    public List<PaymentResponse> getMyPayments(Long patientId) {
        return paymentRepo.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ReceiptResponse> getMyReceipts(Long patientId) {
        return receiptRepo.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(ReceiptResponse::fromEntity)
                .collect(Collectors.toList());
    }

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

    public record BillingSummary(BigDecimal outstandingAmount, int totalInvoices,
                                 long paidInvoices, long pendingInvoices) {}


    // ─── Staff / Admin Mutations ──────────────────────────────────────────────

    // 1. Charges
    @Transactional
    public ChargeResponse createCharge(CreateChargeRequest req, String username) {
        String hashStr = req.getPatientId() + "-" + req.getEncounterId() + "-" + req.getCategory() + "-" + req.getUnitPrice() + "-" + req.getQuantity();
        checkIdempotency("charge", hashStr);
        
        Charge c = new Charge();
        c.setPatientId(req.getPatientId());
        c.setHospitalId(req.getHospitalId());
        c.setEncounterId(req.getEncounterId());
        c.setCategory(req.getCategory());
        c.setDescription(req.getDescription());
        c.setQuantity(req.getQuantity());
        c.setUnitPrice(req.getUnitPrice());
        c.setDiscount(req.getDiscount() != null ? req.getDiscount() : BigDecimal.ZERO);
        c.setTaxRate(req.getTaxRate() != null ? req.getTaxRate() : BigDecimal.ZERO);
        
        BigDecimal base = c.getUnitPrice().multiply(BigDecimal.valueOf(c.getQuantity()));
        BigDecimal afterDiscount = base.subtract(c.getDiscount());
        BigDecimal tax = afterDiscount.multiply(c.getTaxRate().divide(BigDecimal.valueOf(100)));
        c.setLineTotal(afterDiscount.add(tax));
        
        c.setSource(req.getSource() != null ? req.getSource() : "MANUAL");
        c.setCreatedBy(username);
        
        return ChargeResponse.fromEntity(chargeRepo.save(c));
    }

    public List<ChargeResponse> getChargesByPatient(Long patientId) {
        return chargeRepo.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(ChargeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // 2. Invoices
    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest req, String username) {
        Invoice invoice = new Invoice();
        invoice.setPatientId(req.getPatientId());
        invoice.setHospitalId(req.getHospitalId());
        invoice.setEncounterId(req.getEncounterId());
        invoice.setAppointmentId(req.getAppointmentId());
        invoice.setNotes(req.getNotes());
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        invoice.setIssuedAt(LocalDateTime.now());
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setCreatedBy(username);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        Invoice savedInvoice = invoiceRepo.save(invoice);
        
        for (CreateInvoiceRequest.InvoiceItemRequest itemReq : req.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setInvoiceId(savedInvoice.getId());
            item.setItemType(itemReq.getItemType());
            item.setDescription(itemReq.getDescription());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setDiscount(itemReq.getDiscount() != null ? itemReq.getDiscount() : BigDecimal.ZERO);
            item.setTaxRate(itemReq.getTaxRate() != null ? itemReq.getTaxRate() : BigDecimal.ZERO);

            BigDecimal base = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            BigDecimal afterDiscount = base.subtract(item.getDiscount());
            BigDecimal tax = afterDiscount.multiply(item.getTaxRate().divide(BigDecimal.valueOf(100)));
            item.setLineTotal(afterDiscount.add(tax));
            
            subtotal = subtotal.add(afterDiscount);
            totalTax = totalTax.add(tax);
            itemRepo.save(item);
        }

        BigDecimal additionalDiscount = req.getAdditionalDiscount() != null ? req.getAdditionalDiscount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(totalTax).subtract(additionalDiscount);
        
        savedInvoice.setSubtotal(subtotal);
        savedInvoice.setTaxAmount(totalTax);
        savedInvoice.setDiscountAmount(additionalDiscount);
        savedInvoice.setTotalAmount(total);
        savedInvoice.setOutstandingAmount(total);

        return InvoiceResponse.fromEntity(savedInvoice, itemRepo.findByInvoiceId(savedInvoice.getId()));
    }

    // 3. Payments
    @Transactional
    public PaymentResponse recordPayment(RecordPaymentRequest req, String username) {
        String hashStr = req.getInvoiceId() + "-" + req.getAmount() + "-" + req.getPaymentMethod() + "-" + req.getTransactionRef();
        checkIdempotency("payment", hashStr);

        Invoice inv = invoiceRepo.findById(req.getInvoiceId())
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        if (inv.getStatus() == InvoiceStatus.PAID || inv.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Invoice is already paid or cancelled");
        }

        if (req.getAmount().compareTo(inv.getOutstandingAmount()) > 0) {
            throw new IllegalArgumentException("Payment amount exceeds outstanding balance");
        }

        Payment p = new Payment();
        p.setPaymentNumber("PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        p.setInvoiceId(inv.getId());
        p.setPatientId(inv.getPatientId());
        p.setHospitalId(inv.getHospitalId());
        p.setAmount(req.getAmount());
        p.setPaymentMethod(PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase()));
        p.setTransactionRef(req.getTransactionRef());
        p.setGatewayRef(req.getGatewayRef());
        p.setNotes(req.getNotes());
        p.setStatus(PaymentStatus.SUCCESS);
        p.setPaidAt(LocalDateTime.now());
        
        Payment savedPayment = paymentRepo.save(p);

        // Update Invoice
        inv.setPaidAmount(inv.getPaidAmount().add(req.getAmount()));
        inv.setOutstandingAmount(inv.getOutstandingAmount().subtract(req.getAmount()));
        if (inv.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            inv.setStatus(InvoiceStatus.PAID);
            inv.setPaidAt(LocalDateTime.now());
        } else {
            inv.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        // Generate Receipt
        Receipt r = new Receipt();
        r.setReceiptNumber("REC-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        r.setPaymentId(savedPayment.getId());
        r.setInvoiceId(inv.getId());
        r.setPatientId(inv.getPatientId());
        r.setHospitalId(inv.getHospitalId());
        r.setAmount(savedPayment.getAmount());
        r.setIssuedAt(LocalDateTime.now());
        receiptRepo.save(r);

        return PaymentResponse.fromEntity(savedPayment);
    }

    // 4. Refunds
    @Transactional
    public RefundResponse processRefund(RefundRequest req, String username) {
        Payment p = paymentRepo.findById(req.getPaymentId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (p.getStatus() != PaymentStatus.SUCCESS && p.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new IllegalStateException("Payment is not in a refundable state");
        }

        // Check total refunded so far (simple logic: one refund per payment for now, or check sums)
        List<Refund> existingRefunds = refundRepo.findByPaymentIdOrderByCreatedAtDesc(p.getId());
        BigDecimal refundedSoFar = existingRefunds.stream().map(Refund::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal availableToRefund = p.getAmount().subtract(refundedSoFar);

        if (req.getAmount().compareTo(availableToRefund) > 0) {
            throw new IllegalArgumentException("Refund amount exceeds available payment balance");
        }

        Refund r = new Refund();
        r.setRefundReference("REF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        r.setPaymentId(p.getId());
        r.setInvoiceId(p.getInvoiceId());
        r.setPatientId(p.getPatientId());
        r.setHospitalId(p.getHospitalId());
        r.setAmount(req.getAmount());
        r.setReason(req.getReason());
        r.setStatus(RefundStatus.SUCCESS);
        r.setProcessedBy(username);
        
        Refund savedRefund = refundRepo.save(r);

        p.setStatus(req.getAmount().compareTo(availableToRefund) == 0 ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED);
        p.setRefundedAt(LocalDateTime.now());

        // Update Invoice
        Invoice inv = invoiceRepo.findById(p.getInvoiceId()).orElseThrow();
        inv.setPaidAmount(inv.getPaidAmount().subtract(req.getAmount()));
        inv.setOutstandingAmount(inv.getOutstandingAmount().add(req.getAmount()));
        inv.setStatus(inv.getPaidAmount().compareTo(BigDecimal.ZERO) == 0 ? InvoiceStatus.ISSUED : InvoiceStatus.PARTIALLY_PAID);

        return RefundResponse.fromEntity(savedRefund);
    }

    // 5. Adjustments
    @Transactional
    public AdjustmentResponse createAdjustment(AdjustmentRequest req, String username) {
        Invoice inv = invoiceRepo.findById(req.getInvoiceId())
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        if (inv.getStatus() == InvoiceStatus.PAID || inv.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Cannot adjust paid or cancelled invoice");
        }

        BigDecimal originalBalance = inv.getOutstandingAmount();
        BigDecimal newBalance = originalBalance.add(req.getAmount()); // Negative amount reduces balance

        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Adjustment cannot result in negative balance");
        }

        Adjustment adj = new Adjustment();
        adj.setInvoiceId(inv.getId());
        adj.setPatientId(inv.getPatientId());
        adj.setHospitalId(inv.getHospitalId());
        adj.setAmount(req.getAmount());
        adj.setReason(req.getReason());
        adj.setActor(username);
        adj.setOriginalBalance(originalBalance);
        adj.setResultingBalance(newBalance);
        
        Adjustment savedAdj = adjRepo.save(adj);

        inv.setOutstandingAmount(newBalance);
        inv.setTotalAmount(inv.getTotalAmount().add(req.getAmount()));
        // If amount was negative, it is functionally an additional discount.
        if (req.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            inv.setDiscountAmount(inv.getDiscountAmount().add(req.getAmount().abs()));
        }

        return AdjustmentResponse.fromEntity(savedAdj);
    }

    public List<InvoiceResponse> getInvoicesByHospital(Long hospitalId) {
        return invoiceRepo.findAll().stream()
                .filter(i -> i.getHospitalId().equals(hospitalId))
                .map(inv -> InvoiceResponse.fromEntity(inv, itemRepo.findByInvoiceId(inv.getId())))
                .collect(Collectors.toList());
    }
}
