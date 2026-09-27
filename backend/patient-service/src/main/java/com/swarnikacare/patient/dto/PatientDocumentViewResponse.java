package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.PatientDocument;
import com.swarnikacare.patient.entity.PatientDocumentStatus;
import com.swarnikacare.patient.entity.PatientDocumentType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


/**
 * Patient-facing document DTO.
 *
 * SECURITY: fileUrl is intentionally excluded.
 * Patient receives an opaque `accessToken` to retrieve the file via
 * GET /api/v1/patients/me/documents/{id}/access
 * The server validates ownership and issues a redirect/proxy to the actual file.
 */
@Getter
@Setter
@NoArgsConstructor
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

}
