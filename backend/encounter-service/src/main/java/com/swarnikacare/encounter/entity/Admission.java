package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "admissions", indexes = {
        @Index(name = "idx_adm_patient", columnList = "patient_id"),
        @Index(name = "idx_adm_hospital", columnList = "hospital_id"),
        @Index(name = "idx_adm_doctor", columnList = "admitting_doctor_id"),
        @Index(name = "idx_adm_status", columnList = "status"),
        @Index(name = "idx_adm_bed", columnList = "bed_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Admission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admission_number", nullable = false, unique = true, length = 64)
    private String admissionNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "admitting_doctor_id", nullable = false)
    private Long admittingDoctorId;

    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;

    @Column(name = "admission_time", nullable = false)
    private LocalTime admissionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "admission_type", nullable = false, length = 20)
    private AdmissionType admissionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AdmissionStatus status = AdmissionStatus.REQUESTED;

    @Column(name = "ward_id")
    private Long wardId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "bed_id")
    private Long bedId;

    @Column(name = "initiating_staff_user_id", length = 100)
    private String initiatingStaffUserId;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
