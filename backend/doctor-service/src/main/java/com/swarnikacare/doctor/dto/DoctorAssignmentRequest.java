package com.swarnikacare.doctor.dto;

import jakarta.validation.constraints.NotNull;

public class DoctorAssignmentRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private String designation;
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    private Boolean publicAppointmentEnabled = false;
    private Boolean inHouseClinicalEnabled = true;

    public DoctorAssignmentRequest() {}

    public DoctorAssignmentRequest(Long hospitalId, Long departmentId, String designation, String status, Boolean publicAppointmentEnabled, Boolean inHouseClinicalEnabled) {
        this.hospitalId = hospitalId;
        this.departmentId = departmentId;
        this.designation = designation;
        this.status = status != null ? status : "ACTIVE";
        this.publicAppointmentEnabled = publicAppointmentEnabled != null ? publicAppointmentEnabled : false;
        this.inHouseClinicalEnabled = inHouseClinicalEnabled != null ? inHouseClinicalEnabled : true;
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
