package com.swarnikacare.billing.dto;

import com.swarnikacare.billing.entity.Adjustment;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdjustmentResponse {
    private Long id;
    private Long invoiceId;
    private Long patientId;
    private Long hospitalId;
    private BigDecimal amount;
    private String reason;
    private BigDecimal originalBalance;
    private BigDecimal resultingBalance;
    private LocalDateTime createdAt;
    private String actor;

    public static AdjustmentResponse fromEntity(Adjustment adj) {
        return AdjustmentResponse.builder()
                .id(adj.getId())
                .invoiceId(adj.getInvoiceId())
                .patientId(adj.getPatientId())
                .hospitalId(adj.getHospitalId())
                .amount(adj.getAmount())
                .reason(adj.getReason())
                .originalBalance(adj.getOriginalBalance())
                .resultingBalance(adj.getResultingBalance())
                .createdAt(adj.getCreatedAt())
                .actor(adj.getActor())
                .build();
    }
}
