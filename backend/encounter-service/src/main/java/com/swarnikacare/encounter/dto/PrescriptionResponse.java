package com.swarnikacare.encounter.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PrescriptionResponse {
    private Long id;
    private String prescriptionNumber;
    private Long encounterId;
    private Long doctorId;
    private Long patientId;
    private Long hospitalId;
    private String notes;
    private List<PrescriptionItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
