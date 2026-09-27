package com.swarnikacare.patient.dto;

import com.swarnikacare.patient.entity.PatientDocument;
import com.swarnikacare.patient.entity.PatientDocumentStatus;
import com.swarnikacare.patient.entity.PatientDocumentType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@NoArgsConstructor
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

}
