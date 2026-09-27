package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "referrals", indexes = {
        @Index(name = "idx_ref_patient", columnList = "patient_id"),
        @Index(name = "idx_ref_hospital", columnList = "hospital_id"),
        @Index(name = "idx_ref_target_dept", columnList = "target_department_id"),
        @Index(name = "idx_ref_target_doc", columnList = "target_doctor_id"),
        @Index(name = "idx_ref_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "referral_number", nullable = false, unique = true, length = 64)
    private String referralNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "hospital_id", nullable = false)
    private Long hospitalId;

    @Column(name = "referring_doctor_id")
    private Long referringDoctorId;

    @Column(name = "from_department_id")
    private Long fromDepartmentId;

    @Column(name = "target_hospital_id", nullable = false)
    private Long targetHospitalId;

    @Column(name = "target_department_id", nullable = false)
    private Long targetDepartmentId;

    @Column(name = "target_doctor_id")
    private Long targetDoctorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "referral_type", nullable = false, length = 20)
    private ReferralType referralType = ReferralType.INTERNAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReferralPriority priority = ReferralPriority.ROUTINE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReferralStatus status = ReferralStatus.REQUESTED;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "administrative_notes", columnDefinition = "TEXT")
    private String administrativeNotes;

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
