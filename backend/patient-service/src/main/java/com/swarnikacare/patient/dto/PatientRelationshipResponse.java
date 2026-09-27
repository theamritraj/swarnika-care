package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.RelationshipType;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PatientRelationshipResponse {
    private Long id;
    private Long sourcePatientId;
    private Long targetPatientId;
    private RelationshipType relationshipType;
    private String notes;
    private String targetPatientFirstName;
    private String targetPatientLastName;
    private String targetPatientMrn;
    private LocalDateTime createdAt;

}
