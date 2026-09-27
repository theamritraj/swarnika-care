package com.swarnikacare.organization.dto;

public class PositionRequest {
    private Long hospitalId;
    private Long departmentId;
    private Long designationId;
    private String code;
    private String title;
    private String description;
    private Long reportsToPositionId;
    private String status;

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public Long getDesignationId() { return designationId; }
    public void setDesignationId(Long designationId) { this.designationId = designationId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getReportsToPositionId() { return reportsToPositionId; }
    public void setReportsToPositionId(Long reportsToPositionId) { this.reportsToPositionId = reportsToPositionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
