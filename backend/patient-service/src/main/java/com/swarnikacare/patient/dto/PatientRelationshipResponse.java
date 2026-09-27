package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.RelationshipType;
import java.time.LocalDateTime;

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

    public PatientRelationshipResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSourcePatientId() { return sourcePatientId; }
    public void setSourcePatientId(Long sourcePatientId) { this.sourcePatientId = sourcePatientId; }
    public Long getTargetPatientId() { return targetPatientId; }
    public void setTargetPatientId(Long targetPatientId) { this.targetPatientId = targetPatientId; }
    public RelationshipType getRelationshipType() { return relationshipType; }
    public void setRelationshipType(RelationshipType relationshipType) { this.relationshipType = relationshipType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getTargetPatientFirstName() { return targetPatientFirstName; }
    public void setTargetPatientFirstName(String targetPatientFirstName) { this.targetPatientFirstName = targetPatientFirstName; }
    public String getTargetPatientLastName() { return targetPatientLastName; }
    public void setTargetPatientLastName(String targetPatientLastName) { this.targetPatientLastName = targetPatientLastName; }
    public String getTargetPatientMrn() { return targetPatientMrn; }
    public void setTargetPatientMrn(String targetPatientMrn) { this.targetPatientMrn = targetPatientMrn; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
