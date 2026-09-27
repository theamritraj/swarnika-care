package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientDocumentRequest;
import com.swarnikacare.patient.dto.PatientDocumentResponse;

import java.util.List;

public interface PatientDocumentService {
    PatientDocumentResponse addDocument(Long patientId, PatientDocumentRequest request);
    List<PatientDocumentResponse> getDocumentsByPatient(Long patientId);
    PatientDocumentResponse verifyDocument(Long patientId, Long documentId, String verifiedBy);
}
