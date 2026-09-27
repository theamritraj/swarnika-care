package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.PatientDocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PatientDocumentRequest {

    @NotNull(message = "Hospital ID is required")
    private Long hospitalId;

    @NotNull(message = "Document type is required")
    private PatientDocumentType documentType;

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    private LocalDate receivedDate;
    private String notes;

    public PatientDocumentRequest() {}

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public PatientDocumentType getDocumentType() { return documentType; }
    public void setDocumentType(PatientDocumentType documentType) { this.documentType = documentType; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public LocalDate getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDate receivedDate) { this.receivedDate = receivedDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
