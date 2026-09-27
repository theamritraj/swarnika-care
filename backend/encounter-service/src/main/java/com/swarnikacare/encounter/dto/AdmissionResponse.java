package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.AdmissionStatus;
import com.swarnikacare.encounter.entity.AdmissionType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class AdmissionResponse {
    private Long id;
    private String admissionNumber;
    private Long patientId;
    private Long hospitalId;
    private Long departmentId;
    private Long admittingDoctorId;
    private LocalDate admissionDate;
    private LocalTime admissionTime;
    private AdmissionType admissionType;
    private AdmissionStatus status;
    private Long wardId;
    private Long roomId;
    private Long bedId;
    private String initiatingStaffUserId;
    private String reason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdmissionResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAdmissionNumber() { return admissionNumber; }
    public void setAdmissionNumber(String admissionNumber) { this.admissionNumber = admissionNumber; }

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

    public AdmissionStatus getStatus() { return status; }
    public void setStatus(AdmissionStatus status) { this.status = status; }

    public Long getWardId() { return wardId; }
    public void setWardId(Long wardId) { this.wardId = wardId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getBedId() { return bedId; }
    public void setBedId(Long bedId) { this.bedId = bedId; }

    public String getInitiatingStaffUserId() { return initiatingStaffUserId; }
    public void setInitiatingStaffUserId(String initiatingStaffUserId) { this.initiatingStaffUserId = initiatingStaffUserId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
