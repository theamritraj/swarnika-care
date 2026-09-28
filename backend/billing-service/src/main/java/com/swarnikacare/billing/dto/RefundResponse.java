package com.swarnikacare.billing.dto;

import com.swarnikacare.billing.entity.Refund;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RefundResponse {
    private Long id;
    private String refundReference;
    private Long paymentId;
    private Long invoiceId;
    private Long patientId;
    private Long hospitalId;
    private BigDecimal amount;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private String processedBy;

    public static RefundResponse fromEntity(Refund refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .refundReference(refund.getRefundReference())
                .paymentId(refund.getPaymentId())
                .invoiceId(refund.getInvoiceId())
                .patientId(refund.getPatientId())
                .hospitalId(refund.getHospitalId())
                .amount(refund.getAmount())
                .reason(refund.getReason())
                .status(refund.getStatus().name())
                .createdAt(refund.getCreatedAt())
                .processedBy(refund.getProcessedBy())
                .build();
    }
}
