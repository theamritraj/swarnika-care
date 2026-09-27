package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientRelationshipRequest;
import com.swarnikacare.patient.dto.PatientRelationshipResponse;

import java.util.List;

public interface PatientRelationshipService {
    PatientRelationshipResponse addRelationship(Long sourcePatientId, PatientRelationshipRequest request);
    List<PatientRelationshipResponse> getRelationshipsForPatient(Long patientId);
    void deleteRelationship(Long patientId, Long relationshipId);
}
