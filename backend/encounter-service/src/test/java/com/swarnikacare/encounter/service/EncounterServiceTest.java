package com.swarnikacare.encounter.service;

import com.swarnikacare.encounter.dto.EmergencyEncounterRequest;
import com.swarnikacare.encounter.dto.EncounterResponse;
import com.swarnikacare.encounter.dto.OpdEncounterRequest;
import com.swarnikacare.encounter.entity.Encounter;
import com.swarnikacare.encounter.entity.EncounterSource;
import com.swarnikacare.encounter.entity.EncounterStatus;
import com.swarnikacare.encounter.entity.EncounterType;
import com.swarnikacare.encounter.exception.EncounterNotFoundException;
import com.swarnikacare.encounter.exception.InvalidStateTransitionException;
import com.swarnikacare.encounter.repository.EncounterRepository;
import com.swarnikacare.encounter.security.CustomAuthenticationDetails;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EncounterServiceTest {

    @Mock
    private EncounterRepository encounterRepository;

    @Mock
    private com.swarnikacare.encounter.repository.PrescriptionRepository prescriptionRepository;

    @Mock
    private com.swarnikacare.encounter.repository.ClinicalOrderRepository clinicalOrderRepository;

    @InjectMocks
    private EncounterServiceImpl encounterService;

    private Encounter openEncounter;

    @BeforeEach
    void setUp() {
        openEncounter = new Encounter();
        openEncounter.setId(1L);
        openEncounter.setEncounterNumber("ENC-20261025-10001");
        openEncounter.setPatientId(10L);
        openEncounter.setHospitalId(1L);
        openEncounter.setDepartmentId(2L);
        openEncounter.setDoctorId(5L);
        openEncounter.setEncounterType(EncounterType.OPD);
        openEncounter.setStatus(EncounterStatus.OPEN);
        openEncounter.setSource(EncounterSource.SCHEDULED);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createOpdEncounter_Success() {
        OpdEncounterRequest request = new OpdEncounterRequest();
        request.setPatientId(10L);
        request.setHospitalId(1L);
        request.setDepartmentId(2L);
        request.setDoctorId(5L);
        request.setChiefComplaint("Chest pain");

        when(encounterRepository.existsByEncounterNumber(any())).thenReturn(false);
        when(encounterRepository.save(any(Encounter.class))).thenReturn(openEncounter);

        EncounterResponse response = encounterService.createOpdEncounter(request);

        assertNotNull(response);
        assertEquals(EncounterType.OPD, response.getEncounterType());
        assertEquals(EncounterStatus.OPEN, response.getStatus());
        assertEquals(1L, response.getHospitalId());
        verify(encounterRepository, times(1)).save(any(Encounter.class));
    }

    @Test
    void createEmergencyEncounter_WithoutDoctorOrAppointment_Success() {
        EmergencyEncounterRequest request = new EmergencyEncounterRequest();
        request.setPatientId(20L);
        request.setHospitalId(1L);
        request.setDepartmentId(3L);
        request.setChiefComplaint("Trauma");

        Encounter emergencyEncounter = new Encounter();
        emergencyEncounter.setId(2L);
        emergencyEncounter.setEncounterNumber("ENC-20261025-20002");
        emergencyEncounter.setPatientId(20L);
        emergencyEncounter.setHospitalId(1L);
        emergencyEncounter.setDepartmentId(3L);
        emergencyEncounter.setDoctorId(null);
        emergencyEncounter.setEncounterType(EncounterType.EMERGENCY);
        emergencyEncounter.setStatus(EncounterStatus.OPEN);
        emergencyEncounter.setSource(EncounterSource.EMERGENCY);

        when(encounterRepository.existsByEncounterNumber(any())).thenReturn(false);
        when(encounterRepository.save(any(Encounter.class))).thenReturn(emergencyEncounter);

        EncounterResponse response = encounterService.createEmergencyEncounter(request);

        assertNotNull(response);
        assertEquals(EncounterType.EMERGENCY, response.getEncounterType());
        assertNull(response.getDoctorId());
        assertNull(response.getAppointmentId());
        assertEquals(EncounterSource.EMERGENCY, response.getSource());
    }

    @Test
    void startEncounter_FromOpen_Success() {
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EncounterResponse response = encounterService.startEncounter(1L);

        assertNotNull(response);
        assertEquals(EncounterStatus.IN_PROGRESS, response.getStatus());
        assertNotNull(response.getStartedAt());
    }

    @Test
    void startEncounter_AlreadyInProgress_ThrowsInvalidState() {
        openEncounter.setStatus(EncounterStatus.IN_PROGRESS);
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));

        assertThrows(InvalidStateTransitionException.class, () -> encounterService.startEncounter(1L));
        verify(encounterRepository, never()).save(any());
    }

    @Test
    void completeEncounter_FromInProgress_Success() {
        openEncounter.setStatus(EncounterStatus.IN_PROGRESS);
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EncounterResponse response = encounterService.completeEncounter(1L, "Patient discharged with meds");

        assertNotNull(response);
        assertEquals(EncounterStatus.COMPLETED, response.getStatus());
        assertNotNull(response.getEndedAt());
        assertTrue(response.getNotes().contains("Patient discharged with meds"));
    }

    @Test
    void completeEncounter_FromOpen_ThrowsInvalidState() {
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));

        assertThrows(InvalidStateTransitionException.class, () -> encounterService.completeEncounter(1L, "notes"));
        verify(encounterRepository, never()).save(any());
    }

    @Test
    void cancelEncounter_FromOpen_Success() {
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EncounterResponse response = encounterService.cancelEncounter(1L, "Patient left without triage");

        assertNotNull(response);
        assertEquals(EncounterStatus.CANCELLED, response.getStatus());
        assertNotNull(response.getEndedAt());
    }

    @Test
    void cancelEncounter_FromCompleted_ThrowsInvalidState() {
        openEncounter.setStatus(EncounterStatus.COMPLETED);
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));

        assertThrows(InvalidStateTransitionException.class, () -> encounterService.cancelEncounter(1L, "too late"));
        verify(encounterRepository, never()).save(any());
    }

    @Test
    void crossHospitalAccess_ForbiddenForHospitalAdmin() {
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        CustomAuthenticationDetails details = new CustomAuthenticationDetails(servletRequest, 2L); // Hospital 2

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "admin-user", null, List.of(new SimpleGrantedAuthority("ROLE_HOSPITAL_ADMIN")));
        auth.setDetails(details);
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter)); // Belongs to hospital 1

        assertThrows(AccessDeniedException.class, () -> encounterService.getEncounterById(1L));
    }

    @Test
    void crossHospitalAccess_AllowedForSuperAdmin() {
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        CustomAuthenticationDetails details = new CustomAuthenticationDetails(servletRequest, 2L);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "super-admin", null, List.of(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN")));
        auth.setDetails(details);
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));

        EncounterResponse response = encounterService.getEncounterById(1L);
        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getEncountersByDoctorId_Success() {
        when(encounterRepository.findByDoctorId(5L)).thenReturn(List.of(openEncounter));

        List<EncounterResponse> list = encounterService.getEncountersByDoctorId(5L);
        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(5L, list.get(0).getDoctorId());
    }

    @Test
    void updateConsultation_Success() {
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));
        when(encounterRepository.save(any(Encounter.class))).thenAnswer(inv -> inv.getArgument(0));

        com.swarnikacare.encounter.dto.ConsultationUpdateRequest req = new com.swarnikacare.encounter.dto.ConsultationUpdateRequest();
        req.setPrimaryDiagnosis("Acute Bronchitis");
        req.setClinicalNotes("Patient has wheezing and productive cough");
        req.setTreatmentPlan("Antibiotics course for 5 days");

        EncounterResponse response = encounterService.updateConsultation(1L, req);
        assertNotNull(response);
        assertEquals("Acute Bronchitis", response.getPrimaryDiagnosis());
        assertEquals("Patient has wheezing and productive cough", response.getClinicalNotes());
        assertEquals("Antibiotics course for 5 days", response.getTreatmentPlan());
    }

    @Test
    void createPrescription_Success() {
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));
        when(prescriptionRepository.save(any(com.swarnikacare.encounter.entity.Prescription.class)))
                .thenAnswer(inv -> {
                    com.swarnikacare.encounter.entity.Prescription p = inv.getArgument(0);
                    p.setId(101L);
                    return p;
                });

        com.swarnikacare.encounter.dto.PrescriptionCreateRequest req = new com.swarnikacare.encounter.dto.PrescriptionCreateRequest();
        req.setNotes("Take after food");
        com.swarnikacare.encounter.dto.PrescriptionItemDto item = new com.swarnikacare.encounter.dto.PrescriptionItemDto();
        item.setMedicineName("Amoxicillin 500mg");
        item.setDosage("1 tab");
        item.setFrequency("Three times daily");
        item.setDuration("5 days");
        req.setItems(List.of(item));

        com.swarnikacare.encounter.dto.PrescriptionResponse response = encounterService.createPrescription(1L, req, 5L);
        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals(1, response.getItems().size());
        assertEquals("Amoxicillin 500mg", response.getItems().get(0).getMedicineName());
    }

    @Test
    void createClinicalOrder_Success() {
        when(encounterRepository.findById(1L)).thenReturn(Optional.of(openEncounter));
        when(clinicalOrderRepository.save(any(com.swarnikacare.encounter.entity.ClinicalOrder.class)))
                .thenAnswer(inv -> {
                    com.swarnikacare.encounter.entity.ClinicalOrder o = inv.getArgument(0);
                    o.setId(201L);
                    return o;
                });

        com.swarnikacare.encounter.dto.ClinicalOrderCreateRequest req = new com.swarnikacare.encounter.dto.ClinicalOrderCreateRequest();
        req.setOrderType(com.swarnikacare.encounter.entity.ClinicalOrderType.LAB);
        req.setTestName("Complete Blood Count (CBC)");
        req.setPriority("URGENT");
        req.setClinicalIndication("Fever evaluation");

        com.swarnikacare.encounter.dto.ClinicalOrderResponse response = encounterService.createClinicalOrder(1L, req, 5L);
        assertNotNull(response);
        assertEquals(201L, response.getId());
        assertEquals("Complete Blood Count (CBC)", response.getTestName());
        assertEquals("URGENT", response.getPriority());
    }
}
