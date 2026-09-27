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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientHospitalRegistrationServiceTest {

    @Mock
    private PatientHospitalRegistrationRepository registrationRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientHospitalRegistrationServiceImpl registrationService;

    private Patient patient;

    @BeforeEach
    void setUp() {
        patient = new Patient();
        patient.setId(10L);
        patient.setFirstName("Alice");
        patient.setLastName("Smith");
        patient.setMrn("MRN-100010");
    }

    @Test
    void registerPatientAtHospital_Success() {
        PatientHospitalRegistrationRequest request = new PatientHospitalRegistrationRequest(1L, LocalDate.now());

        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));
        when(registrationRepository.existsByPatientIdAndHospitalId(10L, 1L)).thenReturn(false);

        PatientHospitalRegistration saved = new PatientHospitalRegistration();
        saved.setId(100L);
        saved.setPatientId(10L);
        saved.setHospitalId(1L);
        saved.setRegistrationNumber("REG-H1-P10-XYZ123");
        saved.setRegistrationDate(LocalDate.now());
        saved.setStatus(RegistrationStatus.ACTIVE);

        when(registrationRepository.save(any(PatientHospitalRegistration.class))).thenReturn(saved);

        PatientHospitalRegistrationResponse response = registrationService.registerPatientAtHospital(10L, request);

        assertNotNull(response);
        assertEquals(10L, response.getPatientId());
        assertEquals(1L, response.getHospitalId());
        assertEquals("REG-H1-P10-XYZ123", response.getRegistrationNumber());
        assertEquals(RegistrationStatus.ACTIVE, response.getStatus());
        verify(registrationRepository, times(1)).save(any(PatientHospitalRegistration.class));
    }

    @Test
    void registerPatientAtHospital_Duplicate_ThrowsConflict() {
        PatientHospitalRegistrationRequest request = new PatientHospitalRegistrationRequest(1L, LocalDate.now());

        when(patientRepository.findById(10L)).thenReturn(Optional.of(patient));
        when(registrationRepository.existsByPatientIdAndHospitalId(10L, 1L)).thenReturn(true);

        assertThrows(DuplicateResourceException.class,
                () -> registrationService.registerPatientAtHospital(10L, request));
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void registerPatientAtHospital_PatientNotFound_ThrowsException() {
        PatientHospitalRegistrationRequest request = new PatientHospitalRegistrationRequest(1L, LocalDate.now());

        when(patientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PatientNotFoundException.class,
                () -> registrationService.registerPatientAtHospital(999L, request));
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void getHospitalRegistrationsForPatient_ReturnsList() {
        PatientHospitalRegistration reg = new PatientHospitalRegistration();
        reg.setId(100L);
        reg.setPatientId(10L);
        reg.setHospitalId(1L);
        reg.setRegistrationNumber("REG-H1-P10-XYZ123");
        reg.setRegistrationDate(LocalDate.now());
        reg.setStatus(RegistrationStatus.ACTIVE);

        when(patientRepository.existsById(10L)).thenReturn(true);
        when(registrationRepository.findByPatientId(10L)).thenReturn(List.of(reg));

        List<PatientHospitalRegistrationResponse> list = registrationService.getHospitalRegistrationsForPatient(10L);

        assertEquals(1, list.size());
        assertEquals(100L, list.get(0).getId());
    }
}
