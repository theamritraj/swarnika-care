package com.swarnikacare.billing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class RecordPaymentRequest {
    @NotNull private Long invoiceId;
    @NotNull @Positive private BigDecimal amount;
    @NotNull private String paymentMethod;
    private String transactionRef;
    private String gatewayRef;
    private String notes;
}
