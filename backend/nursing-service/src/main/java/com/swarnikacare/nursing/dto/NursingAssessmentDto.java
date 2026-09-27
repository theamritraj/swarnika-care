package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class NursingAssessmentDto {
    @NotNull private Long patientId;
    @NotNull private Long admissionId;
    @NotNull private String assessmentType;
    @NotNull private Map<String, Object> data;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
