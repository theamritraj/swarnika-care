package com.swarnikacare.patient.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_relationships", uniqueConstraints = {
        @UniqueConstraint(name = "uk_relationship", columnNames = {"source_patient_id", "target_patient_id", "relationship_type"})
})
public class PatientRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_patient_id", nullable = false)
    private Long sourcePatientId;

    @Column(name = "target_patient_id", nullable = false)
    private Long targetPatientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_type", nullable = false, length = 30)
    private RelationshipType relationshipType;

    @Column(length = 255)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PatientRelationship() {}

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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
