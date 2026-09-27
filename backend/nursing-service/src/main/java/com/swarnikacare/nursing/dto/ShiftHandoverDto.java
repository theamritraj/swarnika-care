package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;

public class ShiftHandoverDto {
    @NotNull private Long patientId;
    @NotNull private Long admissionId;
    @NotNull private Long unitId;
    @NotNull private String incomingNurseUserId;
    @NotNull private String summary;
    private String pendingTasks;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public String getIncomingNurseUserId() { return incomingNurseUserId; }
    public void setIncomingNurseUserId(String incomingNurseUserId) { this.incomingNurseUserId = incomingNurseUserId; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(String pendingTasks) { this.pendingTasks = pendingTasks; }
}
