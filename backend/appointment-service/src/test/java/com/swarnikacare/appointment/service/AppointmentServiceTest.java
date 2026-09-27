package com.swarnikacare.appointment.service;

import com.swarnikacare.appointment.client.DoctorClient;
import com.swarnikacare.appointment.client.OrganizationClient;
import com.swarnikacare.appointment.client.PatientClient;
import com.swarnikacare.appointment.dto.AppointmentCreateRequest;
import com.swarnikacare.appointment.dto.AppointmentResponse;
import com.swarnikacare.appointment.entity.Appointment;
import com.swarnikacare.appointment.entity.AppointmentStatus;
import com.swarnikacare.appointment.entity.AppointmentType;
import com.swarnikacare.appointment.exception.AppointmentConflictException;
import com.swarnikacare.appointment.exception.DoctorUnavailableException;
import com.swarnikacare.appointment.exception.IntegrationException;
import com.swarnikacare.appointment.exception.InvalidAppointmentTimeException;
import com.swarnikacare.appointment.repository.AppointmentRepository;
import com.swarnikacare.appointment.repository.DoctorScheduleLockRepository;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorScheduleLockRepository doctorScheduleLockRepository;

    @Mock
    private DoctorClient doctorClient;

    @Mock
    private PatientClient patientClient;

    @Mock
    private OrganizationClient organizationClient;

    @Mock
    private com.swarnikacare.appointment.outbox.OutboxEventRepository outboxEventRepository;

    // Removed mock authentication

    private com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private AppointmentServiceImpl appointmentService;

    private AppointmentCreateRequest request;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        appointmentService = new AppointmentServiceImpl(appointmentRepository, doctorScheduleLockRepository, patientClient, doctorClient, organizationClient, outboxEventRepository, objectMapper);
        
        request = new AppointmentCreateRequest();
        request.setPatientId(1L);
        request.setDoctorId(1L);
        request.setHospitalId(1L);
        request.setDepartmentId(1L);
        request.setAppointmentDate(LocalDate.now().plusDays(1)); // Tomorrow
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setAppointmentType(AppointmentType.OPD);
        request.setReason("Headache");

        appointment = new Appointment();
        appointment.setId(1L);
        appointment.setAppointmentNumber("APT-2026-1");
        appointment.setPatientId(1L);
        appointment.setDoctorId(1L);
        appointment.setHospitalId(1L);
        appointment.setDepartmentId(1L);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(LocalTime.of(10, 0));
        appointment.setEndTime(LocalTime.of(11, 0));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setAppointmentType(AppointmentType.OPD);
        appointment.setReason("Headache");

        // Mock security context
        SecurityContextImpl securityContext = new SecurityContextImpl();
        
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
        
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication = 
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("super_admin_id", null, authorities);
            
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    private void mockSuccessfulPatientClient() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        Map<String, Object> data = new HashMap<>();
        data.put("userId", "patient_id");
        response.put("data", data);
        when(patientClient.getPatientById(1L)).thenReturn(response);
    }

    private void mockSuccessfulDoctorClient() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        Map<String, Object> data = new HashMap<>();
        data.put("userId", "doctor_id");
        response.put("data", data);
        when(doctorClient.getDoctorById(1L)).thenReturn(response);
    }
    
    private void mockSuccessfulHospitalClient() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        when(organizationClient.getHospitalById(1L)).thenReturn(response);
    }
    
    private void mockSuccessfulDepartmentClient() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        when(organizationClient.getDepartmentById(1L)).thenReturn(response);
    }

    private void mockDoctorAvailability(boolean isAvailable) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        
        List<Map<String, Object>> availabilities = new ArrayList<>();
        if (isAvailable) {
            Map<String, Object> avail = new HashMap<>();
            avail.put("isActive", true);
            avail.put("dayOfWeek", request.getAppointmentDate().getDayOfWeek().name());
            avail.put("startTime", "09:00");
            avail.put("endTime", "17:00");
            availabilities.add(avail);
        }
        
        response.put("data", availabilities);
        when(doctorClient.getDoctorAvailability(1L)).thenReturn(response);
    }

    @Test
    void createAppointment_Success() {
        mockSuccessfulPatientClient();
        mockSuccessfulDoctorClient();
        mockSuccessfulHospitalClient();
        mockSuccessfulDepartmentClient();
        mockDoctorAvailability(true);
        when(doctorScheduleLockRepository.findByDoctorIdForUpdate(1L)).thenReturn(Optional.empty());
        when(appointmentRepository.findOverlappingAppointments(eq(1L), eq(request.getAppointmentDate()), eq(request.getStartTime()), eq(request.getEndTime())))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        AppointmentResponse response = appointmentService.createAppointment(request);

        assertNotNull(response);
        assertEquals(AppointmentStatus.SCHEDULED, response.getStatus());
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
    }

    @Test
    void createAppointment_InvalidTime_ThrowsException() {
        request.setStartTime(LocalTime.of(11, 0));
        request.setEndTime(LocalTime.of(10, 0));

        assertThrows(InvalidAppointmentTimeException.class, () -> appointmentService.createAppointment(request));
    }

    @Test
    void createAppointment_PatientNotFound_ThrowsException() {
        feign.Request feignRequest = feign.Request.create(feign.Request.HttpMethod.GET, "url", Collections.emptyMap(), null, null, null);
        FeignException.NotFound notFoundEx = new FeignException.NotFound("Not Found", feignRequest, null, Collections.emptyMap());
        when(patientClient.getPatientById(1L)).thenThrow(notFoundEx);

        assertThrows(IntegrationException.class, () -> appointmentService.createAppointment(request));
    }

    @Test
    void createAppointment_DoctorUnavailable_ThrowsException() {
        mockSuccessfulPatientClient();
        mockSuccessfulDoctorClient();
        mockSuccessfulHospitalClient();
        mockSuccessfulDepartmentClient();
        mockDoctorAvailability(false);

        assertThrows(DoctorUnavailableException.class, () -> appointmentService.createAppointment(request));
    }

    @Test
    void createAppointment_Conflict_ThrowsException() {
        mockSuccessfulPatientClient();
        mockSuccessfulDoctorClient();
        mockSuccessfulHospitalClient();
        mockSuccessfulDepartmentClient();
        mockDoctorAvailability(true);
        when(doctorScheduleLockRepository.findByDoctorIdForUpdate(1L)).thenReturn(Optional.empty());
        when(appointmentRepository.findOverlappingAppointments(eq(1L), eq(request.getAppointmentDate()), eq(request.getStartTime()), eq(request.getEndTime())))
                .thenReturn(Collections.singletonList(appointment));

        assertThrows(AppointmentConflictException.class, () -> appointmentService.createAppointment(request));
    }

    @Test
    void createAppointment_AsReceptionist_SuccessWithReceptionSource() {
        // Given security context with ROLE_RECEPTIONIST
        SecurityContextImpl securityContext = new SecurityContextImpl();
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_RECEPTIONIST"));
        UsernamePasswordAuthenticationToken authentication = 
            new UsernamePasswordAuthenticationToken("receptionist_user", null, authorities);
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        mockSuccessfulPatientClient();
        mockSuccessfulDoctorClient();
        mockSuccessfulHospitalClient();
        mockSuccessfulDepartmentClient();
        mockDoctorAvailability(true);

        when(doctorScheduleLockRepository.findByDoctorIdForUpdate(1L)).thenReturn(Optional.empty());
        when(appointmentRepository.findOverlappingAppointments(eq(1L), eq(request.getAppointmentDate()), eq(request.getStartTime()), eq(request.getEndTime())))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment a = invocation.getArgument(0);
            a.setId(99L);
            return a;
        });

        // When
        AppointmentResponse response = appointmentService.createAppointment(request);

        // Then
        assertNotNull(response);
        assertEquals(99L, response.getId());
        verify(appointmentRepository).save(argThat(savedAppt -> 
            savedAppt.getBookingSource() == com.swarnikacare.appointment.entity.BookingSource.RECEPTION
        ));
    }
}
