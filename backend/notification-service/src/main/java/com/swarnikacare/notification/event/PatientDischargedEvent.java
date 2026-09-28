package com.swarnikacare.notification.event;

import java.time.LocalDateTime;

public class PatientDischargedEvent {
    private Long admissionId;
    private Long patientId;
    private String dischargeStatus;
    private String dischargeCondition;
    private LocalDateTime dischargedAt;

    // Getters and Setters
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getDischargeStatus() { return dischargeStatus; }
    public void setDischargeStatus(String dischargeStatus) { this.dischargeStatus = dischargeStatus; }
    public String getDischargeCondition() { return dischargeCondition; }
    public void setDischargeCondition(String dischargeCondition) { this.dischargeCondition = dischargeCondition; }
    public LocalDateTime getDischargedAt() { return dischargedAt; }
    public void setDischargedAt(LocalDateTime dischargedAt) { this.dischargedAt = dischargedAt; }
}
