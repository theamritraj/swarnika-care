package com.swarnikacare.organization.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DepartmentCreateRequest {
    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;
    @NotBlank(message = "Department code is required")
    private String code;
    @NotBlank(message = "Department name is required")
    private String name;
    private String description;
    private Long headDoctorId;
    private Boolean publicVisibility = true;

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getHeadDoctorId() { return headDoctorId; }
    public void setHeadDoctorId(Long headDoctorId) { this.headDoctorId = headDoctorId; }
    public Boolean getPublicVisibility() { return publicVisibility; }
    public void setPublicVisibility(Boolean publicVisibility) { this.publicVisibility = publicVisibility; }
}
