package com.swarnikacare.patient.service;

import com.swarnikacare.patient.controller.PatientController.PatientSelfUpdateRequest;
import com.swarnikacare.patient.dto.PatientCreateRequest;
import com.swarnikacare.patient.dto.PatientHospitalRegistrationRequest;
import com.swarnikacare.patient.dto.PatientResponse;
import com.swarnikacare.patient.dto.PatientUpdateRequest;
import com.swarnikacare.patient.entity.Patient;
import com.swarnikacare.patient.entity.PatientStatus;
import com.swarnikacare.patient.exception.DuplicateResourceException;
import com.swarnikacare.patient.exception.PatientNotFoundException;
import com.swarnikacare.patient.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.swarnikacare.patient.entity.PatientNewbornDetail;
import com.swarnikacare.patient.repository.PatientNewbornDetailRepository;
import com.swarnikacare.patient.dto.RegisterNewbornRequest;
import com.swarnikacare.patient.dto.PatientRelationshipRequest;

@Service
public class PatientServiceImpl implements PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientServiceImpl.class);
    
    private final PatientRepository patientRepository;
    private PatientHospitalRegistrationService registrationService;
    private PatientNewbornDetailRepository newbornDetailRepo;
    private PatientRelationshipService relationshipService;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Autowired(required = false)
    public void setRegistrationService(PatientHospitalRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @Autowired
    public void setNewbornDetailRepo(PatientNewbornDetailRepository newbornDetailRepo) {
        this.newbornDetailRepo = newbornDetailRepo;
    }

    @Autowired
    @Lazy
    public void setRelationshipService(PatientRelationshipService relationshipService) {
        this.relationshipService = relationshipService;
    }
    
    @Transactional
    @Override
    public PatientResponse createPatient(PatientCreateRequest request) {
        log.info("Creating new patient with email: {}", request.getEmail());
        
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Patient already exists with email: " + request.getEmail());
        }

        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setEmergencyContact(request.getEmergencyContact());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setStatus(PatientStatus.ACTIVE);

        // Generate unique MRN
        patient.setMrn(generateUniqueMrn());

        // Resolve userId: prefer explicitly provided IAM userId (patient pre-registered in IAM),
        // fall back to security context (staff creating record), then generate a placeholder.
        if (request.getIamUserId() != null && !request.getIamUserId().isBlank()) {
            patient.setUserId(request.getIamUserId());
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equalsIgnoreCase("anonymousUser")) {
                patient.setUserId(auth.getName());
            } else {
                patient.setUserId("usr-" + UUID.randomUUID().toString().substring(0, 8));
            }
        }
        
        Patient savedPatient = patientRepository.save(patient);
        log.info("Successfully created patient with id: {}, mrn: {}", savedPatient.getId(), savedPatient.getMrn());

        // Optional hospital registration if hospitalId supplied in request
        if (request.getHospitalId() != null && registrationService != null) {
            try {
                registrationService.registerPatientAtHospital(
                        savedPatient.getId(),
                        new PatientHospitalRegistrationRequest(request.getHospitalId(), LocalDate.now()));
            } catch (Exception e) {
                log.warn("Failed to auto-register patient {} at hospital {}: {}",
                        savedPatient.getId(), request.getHospitalId(), e.getMessage());
            }
        }
        
        return mapToResponse(savedPatient);
    }
    
    @Transactional
    @Override
    public PatientResponse registerNewborn(RegisterNewbornRequest request) {
        log.info("Registering newborn for mother: {}", request.getMotherId());
        
        Patient mother = patientRepository.findById(request.getMotherId())
                .orElseThrow(() -> new PatientNotFoundException("Mother not found with id: " + request.getMotherId()));

        Patient baby = new Patient();
        baby.setFirstName(request.getFirstName());
        baby.setLastName(request.getLastName());
        baby.setGender(com.swarnikacare.patient.entity.Gender.valueOf(request.getGender().toUpperCase()));
        baby.setDateOfBirth(request.getDateOfBirth());
        
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        baby.setEmail("baby." + uniqueSuffix + "@swarnikacare.local");
        baby.setPhone("000" + uniqueSuffix.substring(0,7).replaceAll("[^0-9]","1")); 
        baby.setStatus(PatientStatus.ACTIVE);
        
        baby.setMrn(generateUniqueMrn());
        baby.setUserId("usr-" + uniqueSuffix);
        
        Patient savedBaby = patientRepository.save(baby);

        PatientNewbornDetail nd = new PatientNewbornDetail();
        nd.setPatientId(savedBaby.getId());
        nd.setMotherId(mother.getId());
        nd.setBirthWeightKg(request.getBirthWeightKg());
        nd.setGestationalAgeWeeks(request.getGestationalAgeWeeks());
        nd.setDeliveryMethod(request.getDeliveryMethod());
        nd.setTimeOfBirth(request.getTimeOfBirth());
        newbornDetailRepo.save(nd);

        PatientRelationshipRequest relReq = new PatientRelationshipRequest();
        relReq.setTargetPatientId(savedBaby.getId());
        relReq.setRelationshipType(com.swarnikacare.patient.entity.RelationshipType.MOTHER_OF);
        relationshipService.addRelationship(mother.getId(), relReq);

        return mapToResponse(savedBaby);
    }
    
    @Transactional(readOnly = true)
    @Override
    public PatientResponse getPatientByUserId(String userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with user id: " + userId));
        return mapToResponse(patient);
    }
    
    @Transactional(readOnly = true)
    @Override
    public PatientResponse getPatientById(Long id) {
        log.info("Fetching patient by id: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Patient not found with id: {}", id);
                    return new PatientNotFoundException("Patient not found with id: " + id);
                });
        return mapToResponse(patient);
    }
    
    @Transactional(readOnly = true)
    @Override
    public List<PatientResponse> getAllPatients() {
        log.info("Fetching all patients");
        return patientRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    @Override
    public PatientResponse updatePatient(Long id, PatientUpdateRequest request) {
        log.info("Updating patient with id: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Patient not found for update with id: {}", id);
                    return new PatientNotFoundException("Patient not found with id: " + id);
                });
                
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setEmergencyContact(request.getEmergencyContact());
        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }
        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }
        if (request.getStatus() != null) {
            patient.setStatus(request.getStatus());
        }
        
        Patient updatedPatient = patientRepository.save(patient);
        log.info("Successfully updated patient with id: {}", id);
        
        return mapToResponse(updatedPatient);
    }
    
    /**
     * Patient self-service update. Only allowed administrative fields are updated.
     * Patient identity derived from IAM userId — never from request body.
     */
    @Transactional
    @Override
    public PatientResponse updateMyProfile(String userId, PatientSelfUpdateRequest request) {
        log.info("Patient self-update for userId: {}", userId);
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found for user: " + userId));

        // Only update allowed administrative fields
        if (request.getPhone() != null) {
            patient.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }
        if (request.getEmergencyContact() != null) {
            patient.setEmergencyContact(request.getEmergencyContact());
        }
        // MRN, userId, status, clinical fields are NOT updated here

        Patient updated = patientRepository.save(patient);
        log.info("Patient self-update complete for patientId: {}", updated.getId());
        return mapToResponse(updated);
    }

    @Transactional
    @Override
    public void deletePatient(Long id) {
        log.info("Deleting patient with id: {}", id);
        if (!patientRepository.existsById(id)) {
            log.error("Patient not found for deletion with id: {}", id);
            throw new PatientNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
        log.info("Successfully deleted patient with id: {}", id);
    }

    private String generateUniqueMrn() {
        String mrn;
        do {
            int randomNum = 100000 + (int)(Math.random() * 900000);
            mrn = "MRN-" + randomNum;
        } while (patientRepository.existsByMrn(mrn));
        return mrn;
    }
    
    private PatientResponse mapToResponse(Patient patient) {
        PatientResponse response = new PatientResponse(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getEmail(),
                patient.getPhone(),
                patient.getDateOfBirth(),
                patient.getBloodGroup(),
                patient.getEmergencyContact()
        );
        response.setMrn(patient.getMrn());
        response.setUserId(patient.getUserId());
        response.setGender(patient.getGender());
        response.setAddress(patient.getAddress());
        response.setStatus(patient.getStatus());
        response.setCreatedAt(patient.getCreatedAt());
        response.setUpdatedAt(patient.getUpdatedAt());
        return response;
    }
}
