package com.swarnikacare.billing.dto;
import com.swarnikacare.billing.entity.Payment;
import com.swarnikacare.billing.entity.PaymentMethod;
import com.swarnikacare.billing.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public class PaymentResponse {
    private Long id; private String paymentNumber; private Long invoiceId;
    private BigDecimal amount; private String currency;
    private PaymentMethod paymentMethod; private PaymentStatus status;
    private String transactionRef; private LocalDateTime paidAt; private LocalDateTime createdAt;
    public static PaymentResponse fromEntity(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.id = p.getId(); r.paymentNumber = p.getPaymentNumber(); r.invoiceId = p.getInvoiceId();
        r.amount = p.getAmount(); r.currency = p.getCurrency(); r.paymentMethod = p.getPaymentMethod();
        r.status = p.getStatus(); r.transactionRef = p.getTransactionRef();
        r.paidAt = p.getPaidAt(); r.createdAt = p.getCreatedAt();
        return r;
    }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getPaymentNumber() { return paymentNumber; } public void setPaymentNumber(String p) { this.paymentNumber = p; }
    public Long getInvoiceId() { return invoiceId; } public void setInvoiceId(Long i) { this.invoiceId = i; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal a) { this.amount = a; }
    public String getCurrency() { return currency; } public void setCurrency(String c) { this.currency = c; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; } public void setPaymentMethod(PaymentMethod m) { this.paymentMethod = m; }
    public PaymentStatus getStatus() { return status; } public void setStatus(PaymentStatus s) { this.status = s; }
    public String getTransactionRef() { return transactionRef; } public void setTransactionRef(String t) { this.transactionRef = t; }
    public LocalDateTime getPaidAt() { return paidAt; } public void setPaidAt(LocalDateTime p) { this.paidAt = p; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
}
