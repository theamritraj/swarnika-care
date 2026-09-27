package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.RelationshipType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
public class PatientRelationshipRequest {

    @NotNull(message = "Target patient ID is required")
    private Long targetPatientId;

    @NotNull(message = "Relationship type is required")
    private RelationshipType relationshipType;

    private String notes;

    public PatientRelationshipRequest(Long targetPatientId, RelationshipType relationshipType, String notes) {
        this.targetPatientId = targetPatientId;
        this.relationshipType = relationshipType;
        this.notes = notes;
    }

}
