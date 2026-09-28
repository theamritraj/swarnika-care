package com.swarnikacare.billing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class RefundRequest {
    @NotNull private Long paymentId;
    @NotNull @Positive private BigDecimal amount;
    @NotNull private String reason;
}
