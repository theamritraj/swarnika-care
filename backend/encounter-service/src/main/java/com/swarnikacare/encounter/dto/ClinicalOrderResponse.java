package com.swarnikacare.encounter.dto;

import com.swarnikacare.encounter.entity.ClinicalOrderType;
import java.time.LocalDateTime;

public class ClinicalOrderResponse {
    private Long id;
    private String orderNumber;
    private Long encounterId;
    private Long doctorId;
    private Long patientId;
    private Long hospitalId;
    private ClinicalOrderType orderType;
    private String testName;
    private String priority;
    private String clinicalIndication;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ClinicalOrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public Long getEncounterId() { return encounterId; }
    public void setEncounterId(Long encounterId) { this.encounterId = encounterId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public ClinicalOrderType getOrderType() { return orderType; }
    public void setOrderType(ClinicalOrderType orderType) { this.orderType = orderType; }
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getClinicalIndication() { return clinicalIndication; }
    public void setClinicalIndication(String clinicalIndication) { this.clinicalIndication = clinicalIndication; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
