package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ClinicalOrderType;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class ClinicalOrderResponse {
    private Long id;
    private String orderNumber;
    private Long encounterId;
    private Long doctorId;
    private Long patientId;
    private Long hospitalId;
    private ClinicalOrderType orderType;
    private String testName;
    private String priority;
    private String clinicalIndication;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
