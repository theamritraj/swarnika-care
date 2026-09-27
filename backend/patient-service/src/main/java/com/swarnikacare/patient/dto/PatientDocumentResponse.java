package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.PatientDocument;
import com.swarnikacare.patient.entity.PatientDocumentStatus;
import com.swarnikacare.patient.entity.PatientDocumentType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientDocumentResponse {
    private Long id;
    private String documentNumber;
    private Long patientId;
    private Long hospitalId;
    private PatientDocumentType documentType;
    private String documentName;
    private String fileUrl;
    private PatientDocumentStatus status;
    private LocalDate receivedDate;
    private String verifiedBy;
    private String notes;
    private LocalDateTime createdAt;

    public PatientDocumentResponse() {}

    public static PatientDocumentResponse fromEntity(PatientDocument doc) {
        PatientDocumentResponse res = new PatientDocumentResponse();
        res.setId(doc.getId());
        res.setDocumentNumber(doc.getDocumentNumber());
        res.setPatientId(doc.getPatientId());
        res.setHospitalId(doc.getHospitalId());
        res.setDocumentType(doc.getDocumentType());
        res.setDocumentName(doc.getDocumentName());
        res.setFileUrl(doc.getFileUrl());
        res.setStatus(doc.getStatus());
        res.setReceivedDate(doc.getReceivedDate());
        res.setVerifiedBy(doc.getVerifiedBy());
        res.setNotes(doc.getNotes());
        res.setCreatedAt(doc.getCreatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public PatientDocumentType getDocumentType() { return documentType; }
    public void setDocumentType(PatientDocumentType documentType) { this.documentType = documentType; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public PatientDocumentStatus getStatus() { return status; }
    public void setStatus(PatientDocumentStatus status) { this.status = status; }
    public LocalDate getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDate receivedDate) { this.receivedDate = receivedDate; }
    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
