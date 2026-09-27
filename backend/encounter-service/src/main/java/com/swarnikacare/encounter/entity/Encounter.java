package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "encounters", indexes = {
        @Index(name = "idx_enc_patient", columnList = "patient_id"),
        @Index(name = "idx_enc_hospital", columnList = "hospital_id"),
        @Index(name = "idx_enc_doctor", columnList = "doctor_id"),
        @Index(name = "idx_enc_appointment", columnList = "appointment_id"),
        @Index(name = "idx_enc_type", columnList = "encounter_type"),
        @Index(name = "idx_enc_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encounter_number", nullable = false, unique = true, length = 30)
    private String encounterNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "doctor_id")
    private Long doctorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "encounter_type", nullable = false, length = 20)
    private EncounterType encounterType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EncounterStatus status = EncounterStatus.OPEN;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EncounterSource source;

    @Column(name = "chief_complaint", length = 500)
    private String chiefComplaint;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "primary_diagnosis")
    private String primaryDiagnosis;

    @Column(name = "secondary_diagnosis")
    private String secondaryDiagnosis;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "treatment_plan", columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(name = "follow_up_date")
    private java.time.LocalDate followUpDate;

    @Column(name = "follow_up_notes", length = 500)
    private String followUpNotes;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

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
        if (status == null) {
            status = EncounterStatus.OPEN;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public java.time.LocalDate getFollowUpDate() { return followUpDate; }

}
