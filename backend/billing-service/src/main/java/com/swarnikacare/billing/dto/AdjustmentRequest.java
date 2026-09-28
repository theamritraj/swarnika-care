package com.swarnikacare.billing.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class AdjustmentRequest {
    @NotNull private Long invoiceId;
    @NotNull private BigDecimal amount;
    @NotNull private String reason;
}
