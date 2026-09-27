package com.swarnikacare.patient.service;

import com.swarnikacare.patient.dto.PatientCreateRequest;
import com.swarnikacare.patient.dto.PatientResponse;
import com.swarnikacare.patient.entity.Gender;
import com.swarnikacare.patient.entity.Patient;
import com.swarnikacare.patient.entity.PatientStatus;
import com.swarnikacare.patient.exception.DuplicateResourceException;
import com.swarnikacare.patient.exception.PatientNotFoundException;
import com.swarnikacare.patient.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient patient;
    private PatientCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        patient = new Patient(1L, "John", "Doe", "john@example.com", "1234567890", LocalDate.of(1990, 1, 1), "O+", "Jane Doe");
        patient.setMrn("MRN-123456");
        patient.setGender(Gender.MALE);
        patient.setStatus(PatientStatus.ACTIVE);

        createRequest = new PatientCreateRequest("John", "Doe", "john@example.com", "1234567890", LocalDate.of(1990, 1, 1), "O+", "Jane Doe");
        createRequest.setGender(Gender.MALE);
    }

    @Test
    void createPatient_Success() {
        when(patientRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(patientRepository.existsByMrn(any())).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        PatientResponse response = patientService.createPatient(createRequest);

        assertNotNull(response);
        assertEquals(patient.getId(), response.getId());
        assertEquals(createRequest.getEmail(), response.getEmail());
        assertEquals("MRN-123456", response.getMrn());
        assertEquals(Gender.MALE, response.getGender());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void createPatient_DuplicateEmail_ThrowsException() {
        when(patientRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> patientService.createPatient(createRequest));
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void getPatientById_Success() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));

        PatientResponse response = patientService.getPatientById(1L);

        assertNotNull(response);
        assertEquals(patient.getId(), response.getId());
        assertEquals("MRN-123456", response.getMrn());
        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    void getPatientById_NotFound_ThrowsException() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PatientNotFoundException.class, () -> patientService.getPatientById(99L));
        verify(patientRepository, times(1)).findById(99L);
    }
}
