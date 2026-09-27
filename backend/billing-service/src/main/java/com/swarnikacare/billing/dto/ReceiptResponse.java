package com.swarnikacare.billing.dto;
import com.swarnikacare.billing.entity.Receipt;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public class ReceiptResponse {
    private Long id; private String receiptNumber; private Long paymentId; private Long invoiceId;
    private BigDecimal amount; private String currency; private LocalDateTime issuedAt; private LocalDateTime createdAt;
    public static ReceiptResponse fromEntity(Receipt r) {
        ReceiptResponse resp = new ReceiptResponse();
        resp.id = r.getId(); resp.receiptNumber = r.getReceiptNumber(); resp.paymentId = r.getPaymentId();
        resp.invoiceId = r.getInvoiceId(); resp.amount = r.getAmount(); resp.currency = r.getCurrency();
        resp.issuedAt = r.getIssuedAt(); resp.createdAt = r.getCreatedAt();
        return resp;
    }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getReceiptNumber() { return receiptNumber; } public void setReceiptNumber(String r) { this.receiptNumber = r; }
    public Long getPaymentId() { return paymentId; } public void setPaymentId(Long p) { this.paymentId = p; }
    public Long getInvoiceId() { return invoiceId; } public void setInvoiceId(Long i) { this.invoiceId = i; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal a) { this.amount = a; }
    public String getCurrency() { return currency; } public void setCurrency(String c) { this.currency = c; }
    public LocalDateTime getIssuedAt() { return issuedAt; } public void setIssuedAt(LocalDateTime i) { this.issuedAt = i; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
}
