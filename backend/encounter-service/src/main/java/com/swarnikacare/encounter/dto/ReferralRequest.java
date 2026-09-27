package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ReferralPriority;
import com.swarnikacare.encounter.entity.ReferralType;
import jakarta.validation.constraints.NotNull;

public class ReferralRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Origin Hospital ID is required")
    private Long hospitalId;

    private Long referringDoctorId;
    private Long fromDepartmentId;

    @NotNull(message = "Target Hospital ID is required")
    private Long targetHospitalId;

    @NotNull(message = "Target Department ID is required")
    private Long targetDepartmentId;

    private Long targetDoctorId;

    private ReferralType referralType = ReferralType.INTERNAL;
    private ReferralPriority priority = ReferralPriority.ROUTINE;

    @NotNull(message = "Referral reason is required")
    private String reason;

    private String clinicalNotes;
    private String administrativeNotes;

    public ReferralRequest() {}

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

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }

    public String getAdministrativeNotes() { return administrativeNotes; }
    public void setAdministrativeNotes(String administrativeNotes) { this.administrativeNotes = administrativeNotes; }
}
