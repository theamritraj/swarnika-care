package com.swarnikacare.billing.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class CreateInvoiceRequest {
    @NotNull private Long patientId;
    @NotNull private Long hospitalId;
    private Long encounterId;
    private Long appointmentId;
    private String notes;
    private BigDecimal additionalDiscount = BigDecimal.ZERO;

    @NotEmpty
    private List<InvoiceItemRequest> items;

    @Data
    public static class InvoiceItemRequest {
        @NotNull private String itemType;
        @NotNull private String description;
        @NotNull @Positive private Integer quantity = 1;
        @NotNull @Positive private BigDecimal unitPrice;
        private BigDecimal discount = BigDecimal.ZERO;
        private BigDecimal taxRate = BigDecimal.ZERO;
    }
}
