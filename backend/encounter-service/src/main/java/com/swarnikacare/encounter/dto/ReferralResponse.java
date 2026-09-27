package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ReferralPriority;
import com.swarnikacare.encounter.entity.ReferralStatus;
import com.swarnikacare.encounter.entity.ReferralType;
import java.time.LocalDateTime;

public class ReferralResponse {
    private Long id;
    private String referralNumber;
    private Long patientId;
    private Long hospitalId;
    private Long referringDoctorId;
    private Long fromDepartmentId;
    private Long targetHospitalId;
    private Long targetDepartmentId;
    private Long targetDoctorId;
    private ReferralType referralType;
    private ReferralPriority priority;
    private ReferralStatus status;
    private String reason;
    private String clinicalNotes;
    private Long appointmentId;
    private String administrativeNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReferralResponse() {}

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
