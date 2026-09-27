package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.RelationshipType;
import jakarta.validation.constraints.NotNull;

public class PatientRelationshipRequest {

    @NotNull(message = "Target patient ID is required")
    private Long targetPatientId;

    @NotNull(message = "Relationship type is required")
    private RelationshipType relationshipType;

    private String notes;

    public PatientRelationshipRequest() {}

    public PatientRelationshipRequest(Long targetPatientId, RelationshipType relationshipType, String notes) {
        this.targetPatientId = targetPatientId;
        this.relationshipType = relationshipType;
        this.notes = notes;
    }

    public Long getTargetPatientId() { return targetPatientId; }
    public void setTargetPatientId(Long targetPatientId) { this.targetPatientId = targetPatientId; }
    public RelationshipType getRelationshipType() { return relationshipType; }
    public void setRelationshipType(RelationshipType relationshipType) { this.relationshipType = relationshipType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
