package com.swarnikacare.billing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CreateChargeRequest {
    @NotNull private Long patientId;
    @NotNull private Long hospitalId;
    private Long encounterId;
    @NotNull private String category;
    @NotNull private String description;
    @NotNull @Positive private Integer quantity = 1;
    @NotNull @Positive private BigDecimal unitPrice;
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal taxRate = BigDecimal.ZERO;
    private String source = "MANUAL";
}
