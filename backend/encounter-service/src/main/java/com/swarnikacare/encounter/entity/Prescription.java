package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "prescriptions", indexes = {
        @Index(name = "idx_presc_encounter", columnList = "encounter_id"),
        @Index(name = "idx_presc_patient", columnList = "patient_id"),
        @Index(name = "idx_presc_doctor", columnList = "doctor_id"),
        @Index(name = "idx_presc_hospital", columnList = "hospital_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prescription_number", nullable = false, unique = true, length = 30)
    private String prescriptionNumber;

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrescriptionItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addItem(PrescriptionItem item) {
        items.add(item);
        item.setPrescription(this);
    }
}
