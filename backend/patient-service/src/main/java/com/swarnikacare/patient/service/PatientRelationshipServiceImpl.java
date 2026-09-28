package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientRelationshipRequest;
import com.swarnikacare.patient.dto.PatientRelationshipResponse;
import com.swarnikacare.patient.entity.Patient;
import com.swarnikacare.patient.entity.PatientRelationship;
import com.swarnikacare.patient.exception.DuplicateResourceException;
import com.swarnikacare.patient.exception.InvalidRequestException;
import com.swarnikacare.patient.exception.PatientNotFoundException;
import com.swarnikacare.patient.repository.PatientRelationshipRepository;
import com.swarnikacare.patient.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PatientRelationshipServiceImpl implements PatientRelationshipService {

    private static final Logger log = LoggerFactory.getLogger(PatientRelationshipServiceImpl.class);

    private final PatientRelationshipRepository relationshipRepository;
    private final PatientRepository patientRepository;

    public PatientRelationshipServiceImpl(
            PatientRelationshipRepository relationshipRepository,
            PatientRepository patientRepository) {
        this.relationshipRepository = relationshipRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public PatientRelationshipResponse addRelationship(Long sourcePatientId, PatientRelationshipRequest request) {
        log.info("Adding relationship {} from patient {} to patient {}",
                request.getRelationshipType(), sourcePatientId, request.getTargetPatientId());

        if (sourcePatientId.equals(request.getTargetPatientId())) {
            throw new InvalidRequestException("Self-relationship is not permitted: source and target patient must be different");
        }

        patientRepository.findById(sourcePatientId)
                .orElseThrow(() -> new PatientNotFoundException("Source patient not found with id: " + sourcePatientId));

        Patient targetPatient = patientRepository.findById(request.getTargetPatientId())
                .orElseThrow(() -> new PatientNotFoundException("Target patient not found with id: " + request.getTargetPatientId()));

        if (relationshipRepository.existsBySourcePatientIdAndTargetPatientIdAndRelationshipType(
                sourcePatientId, request.getTargetPatientId(), request.getRelationshipType())) {
            throw new DuplicateResourceException(String.format(
                    "Relationship '%s' already exists between patient %d and patient %d",
                    request.getRelationshipType(), sourcePatientId, request.getTargetPatientId()));
        }

        PatientRelationship relationship = new PatientRelationship();
        relationship.setSourcePatientId(sourcePatientId);
        relationship.setTargetPatientId(request.getTargetPatientId());
        relationship.setRelationshipType(request.getRelationshipType());
        relationship.setNotes(request.getNotes());

        PatientRelationship saved = relationshipRepository.save(relationship);
        log.info("Successfully created patient relationship id: {}", saved.getId());

        return mapToResponse(saved, targetPatient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientRelationshipResponse> getRelationshipsForPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with id: " + patientId);
        }

        List<PatientRelationship> relationships = relationshipRepository.findAllByPatientId(patientId);

        return relationships.stream().map(rel -> {
            Long otherPatientId = rel.getSourcePatientId().equals(patientId) ? rel.getTargetPatientId() : rel.getSourcePatientId();
            Optional<Patient> otherPatient = patientRepository.findById(otherPatientId);
            return mapToResponse(rel, otherPatient.orElse(null));
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteRelationship(Long patientId, Long relationshipId) {
        log.info("Deleting relationship {} for patient {}", relationshipId, patientId);

        PatientRelationship relationship = relationshipRepository.findById(relationshipId)
                .orElseThrow(() -> new InvalidRequestException("Relationship not found with id: " + relationshipId));

        if (!relationship.getSourcePatientId().equals(patientId) && !relationship.getTargetPatientId().equals(patientId)) {
            throw new InvalidRequestException("Relationship does not belong to patient id: " + patientId);
        }

        relationshipRepository.delete(relationship);
        log.info("Successfully deleted relationship {}", relationshipId);
    }

    private PatientRelationshipResponse mapToResponse(PatientRelationship rel, Patient targetPatient) {
        PatientRelationshipResponse response = new PatientRelationshipResponse();
        response.setId(rel.getId());
        response.setSourcePatientId(rel.getSourcePatientId());
        response.setTargetPatientId(rel.getTargetPatientId());
        response.setRelationshipType(rel.getRelationshipType());
        response.setNotes(rel.getNotes());
        response.setCreatedAt(rel.getCreatedAt());

        if (targetPatient != null) {
            response.setTargetPatientFirstName(targetPatient.getFirstName());
            response.setTargetPatientLastName(targetPatient.getLastName());
            response.setTargetPatientMrn(targetPatient.getMrn());
        }
        return response;
    }
}
