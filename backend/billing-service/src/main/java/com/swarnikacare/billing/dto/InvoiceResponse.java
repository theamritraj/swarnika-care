package com.swarnikacare.billing.dto;

import com.swarnikacare.billing.entity.Invoice;
import com.swarnikacare.billing.entity.InvoiceItem;
import com.swarnikacare.billing.entity.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Patient-facing invoice response.
 * Excludes: createdBy (internal), notes from staff, internal audit fields.
 */
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
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String n) { this.invoiceNumber = n; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long h) { this.hospitalId = h; }
    public Long getEncounterId() { return encounterId; }
    public void setEncounterId(Long e) { this.encounterId = e; }
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long a) { this.appointmentId = a; }
    public String getCurrency() { return currency; }
    public void setCurrency(String c) { this.currency = c; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal s) { this.subtotal = s; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal t) { this.taxAmount = t; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal d) { this.discountAmount = d; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal t) { this.totalAmount = t; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal p) { this.paidAmount = p; }
    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal o) { this.outstandingAmount = o; }
    public InvoiceStatus getStatus() { return status; }
    public void setStatus(InvoiceStatus s) { this.status = s; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime i) { this.issuedAt = i; }
    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime d) { this.dueAt = d; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime p) { this.paidAt = p; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
    public List<InvoiceItemResponse> getItems() { return items; }
    public void setItems(List<InvoiceItemResponse> items) { this.items = items; }
}
