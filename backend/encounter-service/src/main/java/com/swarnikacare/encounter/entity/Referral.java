package com.swarnikacare.encounter.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "referrals", indexes = {
        @Index(name = "idx_ref_patient", columnList = "patient_id"),
        @Index(name = "idx_ref_hospital", columnList = "hospital_id"),
        @Index(name = "idx_ref_target_dept", columnList = "target_department_id"),
        @Index(name = "idx_ref_target_doc", columnList = "target_doctor_id"),
        @Index(name = "idx_ref_status", columnList = "status")
})
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

    public Referral() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferralNumber() { return referralNumber; }
    public void setReferralNumber(String referralNumber) { this.referralNumber = referralNumber; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public Long getReferringDoctorId() { return referringDoctorId; }
    public void setReferringDoctorId(Long referringDoctorId) { this.referringDoctorId = referringDoctorId; }

    public Long getFromDepartmentId() { return fromDepartmentId; }
    public void setFromDepartmentId(Long fromDepartmentId) { this.fromDepartmentId = fromDepartmentId; }

    public Long getTargetHospitalId() { return targetHospitalId; }
    public void setTargetHospitalId(Long targetHospitalId) { this.targetHospitalId = targetHospitalId; }

    public Long getTargetDepartmentId() { return targetDepartmentId; }
    public void setTargetDepartmentId(Long targetDepartmentId) { this.targetDepartmentId = targetDepartmentId; }

    public Long getTargetDoctorId() { return targetDoctorId; }
    public void setTargetDoctorId(Long targetDoctorId) { this.targetDoctorId = targetDoctorId; }

    public ReferralType getReferralType() { return referralType; }
    public void setReferralType(ReferralType referralType) { this.referralType = referralType; }

    public ReferralPriority getPriority() { return priority; }
    public void setPriority(ReferralPriority priority) { this.priority = priority; }

    public ReferralStatus getStatus() { return status; }
    public void setStatus(ReferralStatus status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getAdministrativeNotes() { return administrativeNotes; }
    public void setAdministrativeNotes(String administrativeNotes) { this.administrativeNotes = administrativeNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
