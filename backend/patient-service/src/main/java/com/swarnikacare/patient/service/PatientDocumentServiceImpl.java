package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientDocumentRequest;
import com.swarnikacare.patient.dto.PatientDocumentResponse;
import com.swarnikacare.patient.entity.PatientDocument;
import com.swarnikacare.patient.entity.PatientDocumentStatus;
import com.swarnikacare.patient.repository.PatientDocumentRepository;
import com.swarnikacare.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientDocumentServiceImpl implements PatientDocumentService {

    private final PatientDocumentRepository documentRepository;
    private final PatientRepository patientRepository;

    public PatientDocumentServiceImpl(PatientDocumentRepository documentRepository, PatientRepository patientRepository) {
        this.documentRepository = documentRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public PatientDocumentResponse addDocument(Long patientId, PatientDocumentRequest request) {
        if (!patientRepository.existsById(patientId)) {
            throw new IllegalArgumentException("Patient not found with id: " + patientId);
        }

        PatientDocument doc = new PatientDocument();
        String docNumber = "DOC-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (System.currentTimeMillis() % 100000);
        doc.setDocumentNumber(docNumber);
        doc.setPatientId(patientId);
        doc.setHospitalId(request.getHospitalId());
        doc.setDocumentType(request.getDocumentType());
        doc.setDocumentName(request.getDocumentName());
        doc.setFileUrl(request.getFileUrl());
        doc.setStatus(PatientDocumentStatus.PENDING_VERIFICATION);
        doc.setReceivedDate(request.getReceivedDate() != null ? request.getReceivedDate() : LocalDate.now());
        doc.setNotes(request.getNotes());

        PatientDocument saved = documentRepository.save(doc);
        return PatientDocumentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDocumentResponse> getDocumentsByPatient(Long patientId) {
        return documentRepository.findByPatientId(patientId).stream()
                .map(PatientDocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PatientDocumentResponse verifyDocument(Long patientId, Long documentId, String verifiedBy) {
        PatientDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + documentId));
        if (!doc.getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Document does not belong to patient id: " + patientId);
        }

        doc.setStatus(PatientDocumentStatus.VERIFIED);
        doc.setVerifiedBy(verifiedBy != null ? verifiedBy : "Front Desk Receptionist");
        PatientDocument saved = documentRepository.save(doc);
        return PatientDocumentResponse.fromEntity(saved);
    }
}
