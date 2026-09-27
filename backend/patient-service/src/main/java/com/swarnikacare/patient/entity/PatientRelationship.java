package com.swarnikacare.patient.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "patient_relationships", uniqueConstraints = {
        @UniqueConstraint(name = "uk_relationship", columnNames = {"source_patient_id", "target_patient_id", "relationship_type"})
})
@Getter
@Setter
@NoArgsConstructor
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

}
