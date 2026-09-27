package com.swarnikacare.doctor.dto;

import java.time.LocalDateTime;

public class DoctorAssignmentResponse {

    private Long id;
    private Long doctorId;
    private Long hospitalId;
    private Long departmentId;
    private String designation;
    private String status;
    private Boolean publicAppointmentEnabled;
    private Boolean inHouseClinicalEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DoctorAssignmentResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getPublicAppointmentEnabled() {
        return publicAppointmentEnabled;
    }

    public void setPublicAppointmentEnabled(Boolean publicAppointmentEnabled) {
        this.publicAppointmentEnabled = publicAppointmentEnabled;
    }

    public Boolean getInHouseClinicalEnabled() {
        return inHouseClinicalEnabled;
    }

    public void setInHouseClinicalEnabled(Boolean inHouseClinicalEnabled) {
        this.inHouseClinicalEnabled = inHouseClinicalEnabled;
    }
}
