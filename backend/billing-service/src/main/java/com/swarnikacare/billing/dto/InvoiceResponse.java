package com.swarnikacare.billing.dto;

import com.swarnikacare.billing.entity.Invoice;
import com.swarnikacare.billing.entity.InvoiceItem;
import com.swarnikacare.billing.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


/**
 * Patient-facing invoice response.
 * Excludes: createdBy (internal), notes from staff, internal audit fields.
 */
@Getter
@Setter
@NoArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long hospitalId;
    private Long encounterId;
    private Long appointmentId;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
    private InvoiceStatus status;
    private LocalDateTime issuedAt;
    private LocalDateTime dueAt;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private List<InvoiceItemResponse> items;

    public static InvoiceResponse fromEntity(Invoice inv, List<InvoiceItem> items) {
        InvoiceResponse r = new InvoiceResponse();
        r.setId(inv.getId());
        r.setInvoiceNumber(inv.getInvoiceNumber());
        r.setHospitalId(inv.getHospitalId());
        r.setEncounterId(inv.getEncounterId());
        r.setAppointmentId(inv.getAppointmentId());
        r.setCurrency(inv.getCurrency());
        r.setSubtotal(inv.getSubtotal());
        r.setTaxAmount(inv.getTaxAmount());
        r.setDiscountAmount(inv.getDiscountAmount());
        r.setTotalAmount(inv.getTotalAmount());
        r.setPaidAmount(inv.getPaidAmount());
        r.setOutstandingAmount(inv.getOutstandingAmount());
        r.setStatus(inv.getStatus());
        r.setIssuedAt(inv.getIssuedAt());
        r.setDueAt(inv.getDueAt());
        r.setPaidAt(inv.getPaidAt());
        r.setCreatedAt(inv.getCreatedAt());
        if (items != null) {
            r.setItems(items.stream().map(InvoiceItemResponse::fromEntity).collect(Collectors.toList()));
        }
        return r;
    }

    // Getters/Setters

}
