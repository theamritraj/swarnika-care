package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.*;
import com.swarnikacare.doctor.dto.DoctorOnboardingCompleteRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingInitiateRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingResponse;
import com.swarnikacare.doctor.entity.Doctor;
import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import com.swarnikacare.doctor.entity.DoctorProfile;
import com.swarnikacare.doctor.exception.DuplicateResourceException;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.repository.DoctorProfileRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorOnboardingServiceImplTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorProfileRepository doctorProfileRepository;

    @Mock
    private DoctorHospitalAssignmentRepository doctorHospitalAssignmentRepository;

    @Mock
    private IamClient iamClient;

    @Mock
    private OrganizationClient organizationClient;

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private DoctorOnboardingServiceImpl onboardingService;

    private DoctorOnboardingInitiateRequest initiateRequest;
    private DoctorOnboardingCompleteRequest completeRequest;

    @BeforeEach
    void setUp() {
        initiateRequest = new DoctorOnboardingInitiateRequest();
        initiateRequest.setFirstName("Rajesh");
        initiateRequest.setLastName("Sharma");
        initiateRequest.setEmail("dr.rajesh@swarnika.com");
        initiateRequest.setHospitalId(101L);
        initiateRequest.setDepartmentId(101L);

        completeRequest = new DoctorOnboardingCompleteRequest();
        completeRequest.setFirstName("Rajesh");
        completeRequest.setLastName("Sharma");
        completeRequest.setEmail("dr.rajesh@swarnika.com");
        completeRequest.setHospitalId(101L);
        completeRequest.setDepartmentId(101L);
        completeRequest.setDesignation("Senior Consultant");
        completeRequest.setSpecialization("Cardiology");
        completeRequest.setRegistrationNumber("MCI-12345");
        completeRequest.setDefaultConsultationFee(new BigDecimal("800"));
        completeRequest.setOtp("123456");
    }

    @Test
    void initiateOnboarding_Success_SendsOtp() {
        when(doctorRepository.findByEmail("dr.rajesh@swarnika.com")).thenReturn(Optional.empty());
        when(iamClient.sendVerificationOtp(any())).thenReturn(Map.of("success", true));

        String result = onboardingService.initiateOnboarding(initiateRequest);

        assertTrue(result.contains("Verification code sent to"));
        verify(iamClient, times(1)).sendVerificationOtp(any());
    }

    @Test
    void initiateOnboarding_DuplicateDoctorEmail_ThrowsDuplicateResource() {
        when(doctorRepository.findByEmail("dr.rajesh@swarnika.com")).thenReturn(Optional.of(new Doctor()));

        assertThrows(DuplicateResourceException.class, () -> onboardingService.initiateOnboarding(initiateRequest));
        verify(iamClient, never()).sendVerificationOtp(any());
    }

    @Test
    void completeOnboarding_InvalidOtp_ThrowsIllegalArgument() {
        when(doctorRepository.findByEmail("dr.rajesh@swarnika.com")).thenReturn(Optional.empty());
        when(iamClient.verifyOtp(any())).thenReturn(Map.of("success", true, "valid", false));

        assertThrows(IllegalArgumentException.class, () -> onboardingService.completeOnboarding(completeRequest));
        verify(iamClient, never()).provisionDoctor(any());
        verify(doctorRepository, never()).save(any());
    }

    @Test
    void completeOnboarding_Success_ProvisionsAllAndDispatchesWelcome() {
        when(doctorRepository.findByEmail("dr.rajesh@swarnika.com")).thenReturn(Optional.empty());
        when(iamClient.verifyOtp(any())).thenReturn(Map.of("success", true, "valid", true));

        UserResponse userResponse = new UserResponse(201L, "dr.rajesh@swarnika.com", "DOCTOR", "ACTIVE");
        when(iamClient.provisionDoctor(any())).thenReturn(userResponse);

        Doctor savedDoctor = new Doctor();
        savedDoctor.setId(10L);
        savedDoctor.setUserId("201");
        savedDoctor.setFirstName("Rajesh");
        savedDoctor.setLastName("Sharma");
        savedDoctor.setEmail("dr.rajesh@swarnika.com");
        when(doctorRepository.save(any(Doctor.class))).thenReturn(savedDoctor);

        when(organizationClient.getHospitalById(101L)).thenReturn(Map.of("name", "Swarnika Hospitals"));
        when(organizationClient.getDepartmentById(101L)).thenReturn(Map.of("name", "Cardiology"));
        when(notificationClient.sendDoctorWelcome(any())).thenReturn(Map.of("status", "SENT"));

        DoctorOnboardingResponse response = onboardingService.completeOnboarding(completeRequest);

        assertNotNull(response);
        assertEquals(10L, response.getDoctorId());
        assertEquals("Dr. Rajesh Sharma", response.getDoctorName());
        assertEquals("Swarnika Hospitals", response.getHospitalName());
        assertEquals("Cardiology", response.getDepartmentName());
        assertEquals("SENT", response.getWelcomeEmailStatus());

        verify(doctorProfileRepository, times(1)).save(any(DoctorProfile.class));
        verify(doctorHospitalAssignmentRepository, times(1)).save(any(DoctorHospitalAssignment.class));
        verify(notificationClient, times(1)).sendDoctorWelcome(any());
    }

    @Test
    void completeOnboarding_DoctorSaveFailure_CompensatesIamUser() {
        when(doctorRepository.findByEmail("dr.rajesh@swarnika.com")).thenReturn(Optional.empty());
        when(iamClient.verifyOtp(any())).thenReturn(Map.of("success", true, "valid", true));

        UserResponse userResponse = new UserResponse(201L, "dr.rajesh@swarnika.com", "DOCTOR", "ACTIVE");
        when(iamClient.provisionDoctor(any())).thenReturn(userResponse);

        when(doctorRepository.save(any(Doctor.class))).thenThrow(new RuntimeException("DB Connection timeout"));

        assertThrows(RuntimeException.class, () -> onboardingService.completeOnboarding(completeRequest));
        verify(iamClient, times(1)).deleteUser(201L);
        verify(notificationClient, never()).sendDoctorWelcome(any());
    }

    @Test
    void completeOnboarding_NotificationFailure_DoesNotFailOnboarding() {
        when(doctorRepository.findByEmail("dr.rajesh@swarnika.com")).thenReturn(Optional.empty());
        when(iamClient.verifyOtp(any())).thenReturn(Map.of("success", true, "valid", true));

        UserResponse userResponse = new UserResponse(201L, "dr.rajesh@swarnika.com", "DOCTOR", "ACTIVE");
        when(iamClient.provisionDoctor(any())).thenReturn(userResponse);

        Doctor savedDoctor = new Doctor();
        savedDoctor.setId(10L);
        savedDoctor.setUserId("201");
        savedDoctor.setFirstName("Rajesh");
        savedDoctor.setLastName("Sharma");
        savedDoctor.setEmail("dr.rajesh@swarnika.com");
        when(doctorRepository.save(any(Doctor.class))).thenReturn(savedDoctor);

        when(notificationClient.sendDoctorWelcome(any())).thenThrow(new RuntimeException("SMTP Host Unreachable"));

        DoctorOnboardingResponse response = onboardingService.completeOnboarding(completeRequest);

        assertNotNull(response);
        assertEquals(10L, response.getDoctorId());
        assertEquals("QUEUED", response.getWelcomeEmailStatus()); // Graceful fallback
        verify(iamClient, never()).deleteUser(any()); // MUST NOT ROLL BACK
    }

    @Test
    void resendOtp_Success() {
        when(doctorRepository.findByEmail("dr.rajesh@swarnika.com")).thenReturn(Optional.empty());
        when(iamClient.sendVerificationOtp(any())).thenReturn(Map.of("success", true));

        String result = onboardingService.resendOnboardingOtp("dr.rajesh@swarnika.com");
        assertTrue(result.contains("Verification code resent to"));
        verify(iamClient, times(1)).sendVerificationOtp(any());
    }
}
