package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.AdmissionType;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class AdmissionRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotNull(message = "Admitting Doctor ID is required")
    private Long admittingDoctorId;

    private LocalDate admissionDate;
    private LocalTime admissionTime;
    private AdmissionType admissionType = AdmissionType.ELECTIVE;
    private Long wardId;
    private Long roomId;
    private Long bedId;

    @NotNull(message = "Admission reason is required")
    private String reason;

    private String notes;

    public AdmissionRequest() {}

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getAdmittingDoctorId() { return admittingDoctorId; }
    public void setAdmittingDoctorId(Long admittingDoctorId) { this.admittingDoctorId = admittingDoctorId; }

    public LocalDate getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }

    public LocalTime getAdmissionTime() { return admissionTime; }
    public void setAdmissionTime(LocalTime admissionTime) { this.admissionTime = admissionTime; }

    public AdmissionType getAdmissionType() { return admissionType; }
    public void setAdmissionType(AdmissionType admissionType) { this.admissionType = admissionType; }

    public Long getWardId() { return wardId; }
    public void setWardId(Long wardId) { this.wardId = wardId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getBedId() { return bedId; }
    public void setBedId(Long bedId) { this.bedId = bedId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
