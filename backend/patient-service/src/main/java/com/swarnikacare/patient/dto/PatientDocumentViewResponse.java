package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.PatientDocument;
import com.swarnikacare.patient.entity.PatientDocumentStatus;
import com.swarnikacare.patient.entity.PatientDocumentType;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Patient-facing document DTO.
 *
 * SECURITY: fileUrl is intentionally excluded.
 * Patient receives an opaque `accessToken` to retrieve the file via
 * GET /api/v1/patients/me/documents/{id}/access
 * The server validates ownership and issues a redirect/proxy to the actual file.
 */
public class PatientDocumentViewResponse {

    private Long id;
    private String documentNumber;
    private PatientDocumentType documentType;
    private String documentName;
    private PatientDocumentStatus status;
    private LocalDate receivedDate;
    private LocalDateTime createdAt;
    // fileUrl is intentionally absent
    // verifiedBy is intentionally absent (internal operational field)
    // notes from staff are intentionally absent

    public PatientDocumentViewResponse() {}

    public static PatientDocumentViewResponse fromEntity(PatientDocument doc) {
        PatientDocumentViewResponse r = new PatientDocumentViewResponse();
        r.setId(doc.getId());
        r.setDocumentNumber(doc.getDocumentNumber());
        r.setDocumentType(doc.getDocumentType());
        r.setDocumentName(doc.getDocumentName());
        r.setStatus(doc.getStatus());
        r.setReceivedDate(doc.getReceivedDate());
        r.setCreatedAt(doc.getCreatedAt());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public PatientDocumentType getDocumentType() { return documentType; }
    public void setDocumentType(PatientDocumentType documentType) { this.documentType = documentType; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public PatientDocumentStatus getStatus() { return status; }
    public void setStatus(PatientDocumentStatus status) { this.status = status; }
    public LocalDate getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDate receivedDate) { this.receivedDate = receivedDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
