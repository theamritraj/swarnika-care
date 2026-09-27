package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientHospitalRegistrationRequest;
import com.swarnikacare.patient.dto.PatientHospitalRegistrationResponse;
import com.swarnikacare.patient.entity.Patient;
import com.swarnikacare.patient.entity.PatientHospitalRegistration;
import com.swarnikacare.patient.entity.RegistrationStatus;
import com.swarnikacare.patient.exception.DuplicateResourceException;
import com.swarnikacare.patient.exception.PatientNotFoundException;
import com.swarnikacare.patient.repository.PatientHospitalRegistrationRepository;
import com.swarnikacare.patient.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PatientHospitalRegistrationServiceImpl implements PatientHospitalRegistrationService {

    private static final Logger log = LoggerFactory.getLogger(PatientHospitalRegistrationServiceImpl.class);

    private final PatientHospitalRegistrationRepository registrationRepository;
    private final PatientRepository patientRepository;

    public PatientHospitalRegistrationServiceImpl(
            PatientHospitalRegistrationRepository registrationRepository,
            PatientRepository patientRepository) {
        this.registrationRepository = registrationRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public PatientHospitalRegistrationResponse registerPatientAtHospital(Long patientId, PatientHospitalRegistrationRequest request) {
        log.info("Registering patient {} at hospital {}", patientId, request.getHospitalId());

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + patientId));

        if (registrationRepository.existsByPatientIdAndHospitalId(patientId, request.getHospitalId())) {
            throw new DuplicateResourceException(
                    "Patient " + patientId + " is already registered at hospital " + request.getHospitalId());
        }

        String registrationNumber = generateRegistrationNumber(request.getHospitalId(), patientId);

        PatientHospitalRegistration registration = new PatientHospitalRegistration();
        registration.setPatientId(patientId);
        registration.setHospitalId(request.getHospitalId());
        registration.setRegistrationNumber(registrationNumber);
        registration.setRegistrationDate(request.getRegistrationDate() != null ? request.getRegistrationDate() : LocalDate.now());
        registration.setStatus(RegistrationStatus.ACTIVE);

        PatientHospitalRegistration saved = registrationRepository.save(registration);
        log.info("Successfully registered patient {} at hospital {} with registration number {}",
                patientId, request.getHospitalId(), saved.getRegistrationNumber());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientHospitalRegistrationResponse> getHospitalRegistrationsForPatient(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new PatientNotFoundException("Patient not found with id: " + patientId);
        }
        return registrationRepository.findByPatientId(patientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientHospitalRegistrationResponse> getRegistrationsForHospital(Long hospitalId) {
        return registrationRepository.findByHospitalId(hospitalId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private String generateRegistrationNumber(Long hospitalId, Long patientId) {
        return "REG-H" + hospitalId + "-P" + patientId + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private PatientHospitalRegistrationResponse mapToResponse(PatientHospitalRegistration registration) {
        PatientHospitalRegistrationResponse response = new PatientHospitalRegistrationResponse();
        response.setId(registration.getId());
        response.setPatientId(registration.getPatientId());
        response.setHospitalId(registration.getHospitalId());
        response.setRegistrationNumber(registration.getRegistrationNumber());
        response.setRegistrationDate(registration.getRegistrationDate());
        response.setStatus(registration.getStatus());
        response.setCreatedAt(registration.getCreatedAt());
        response.setUpdatedAt(registration.getUpdatedAt());
        return response;
    }
}
