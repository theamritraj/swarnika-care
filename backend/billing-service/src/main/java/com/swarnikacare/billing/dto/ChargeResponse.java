package com.swarnikacare.billing.dto;

import com.swarnikacare.billing.entity.Charge;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ChargeResponse {
    private Long id;
    private Long patientId;
    private Long hospitalId;
    private Long encounterId;
    private String category;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private BigDecimal taxRate;
    private BigDecimal lineTotal;
    private String status;
    private String source;
    private LocalDateTime createdAt;
    private String createdBy;

    public static ChargeResponse fromEntity(Charge charge) {
        return ChargeResponse.builder()
                .id(charge.getId())
                .patientId(charge.getPatientId())
                .hospitalId(charge.getHospitalId())
                .encounterId(charge.getEncounterId())
                .category(charge.getCategory())
                .description(charge.getDescription())
                .quantity(charge.getQuantity())
                .unitPrice(charge.getUnitPrice())
                .discount(charge.getDiscount())
                .taxRate(charge.getTaxRate())
                .lineTotal(charge.getLineTotal())
                .status(charge.getStatus().name())
                .source(charge.getSource())
                .createdAt(charge.getCreatedAt())
                .createdBy(charge.getCreatedBy())
                .build();
    }
}
