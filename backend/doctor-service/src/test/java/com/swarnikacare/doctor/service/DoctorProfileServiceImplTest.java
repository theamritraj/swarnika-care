package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.dto.DoctorProfileRequest;
import com.swarnikacare.doctor.dto.DoctorProfileResponse;
import com.swarnikacare.doctor.entity.Doctor;
import com.swarnikacare.doctor.entity.DoctorProfile;
import com.swarnikacare.doctor.entity.PublicProfileStatus;
import com.swarnikacare.doctor.exception.DoctorNotFoundException;
import com.swarnikacare.doctor.repository.DoctorProfileRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DoctorProfileServiceImplTest {

    @Mock
    private DoctorProfileRepository profileRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository assignmentRepository;

    @InjectMocks
    private DoctorProfileServiceImpl profileService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUpsertProfile_Success() {
        Doctor mockDoctor = new Doctor();
        mockDoctor.setId(1L);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(mockDoctor));

        DoctorProfile mockProfile = new DoctorProfile();
        when(profileRepository.findByDoctorId(1L)).thenReturn(Optional.of(mockProfile));
        when(profileRepository.save(any(DoctorProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DoctorProfileRequest request = new DoctorProfileRequest();
        request.setBio("Test Bio");
        
        DoctorProfileResponse response = profileService.upsertProfile(1L, request);
        
        assertEquals("Test Bio", response.getBio());
        verify(profileRepository, times(1)).save(any(DoctorProfile.class));
    }

    @Test
    void testUpsertProfile_DoctorNotFound() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.empty());
        DoctorProfileRequest request = new DoctorProfileRequest();
        
        assertThrows(DoctorNotFoundException.class, () -> profileService.upsertProfile(1L, request));
    }

    @Test
    void testUpdateStatus_Success() {
        Doctor mockDoctor = new Doctor();
        mockDoctor.setId(1L);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(mockDoctor));

        DoctorProfile mockProfile = new DoctorProfile();
        mockProfile.setDoctorId(1L);
        mockProfile.setStatus(PublicProfileStatus.DRAFT);
        when(profileRepository.findByDoctorId(1L)).thenReturn(Optional.of(mockProfile));
        when(profileRepository.save(any(DoctorProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DoctorProfileResponse response = profileService.updateStatus(1L, PublicProfileStatus.REVIEW);
        
        assertEquals(PublicProfileStatus.REVIEW, response.getStatus());
    }

    @Test
    void testUpdateStatus_ProfileNotFound() {
        Doctor mockDoctor = new Doctor();
        mockDoctor.setId(1L);
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(mockDoctor));
        
        when(profileRepository.findByDoctorId(1L)).thenReturn(Optional.empty());
        
        assertThrows(IllegalArgumentException.class, () -> profileService.updateStatus(1L, PublicProfileStatus.REVIEW));
    }

    @Test
    void testGetPublishedProfiles() {
        DoctorProfile pubProfile = new DoctorProfile();
        pubProfile.setDoctorId(1L);
        pubProfile.setStatus(PublicProfileStatus.PUBLISHED);
        
        when(profileRepository.findByStatus(PublicProfileStatus.PUBLISHED)).thenReturn(List.of(pubProfile));
        
        Doctor mockDoctor = new Doctor();
        mockDoctor.setId(1L);
        mockDoctor.setFirstName("John");
        mockDoctor.setStatus("ACTIVE");
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(mockDoctor));
        
        com.swarnikacare.doctor.entity.DoctorHospitalAssignment assignment = new com.swarnikacare.doctor.entity.DoctorHospitalAssignment();
        assignment.setStatus("ACTIVE");
        assignment.setPublicAppointmentEnabled(true);
        when(assignmentRepository.findByDoctorId(1L)).thenReturn(List.of(assignment));
        
        List<DoctorProfileResponse> responses = profileService.getPublishedProfiles(null, null);
        
        assertEquals(1, responses.size());
        assertEquals(PublicProfileStatus.PUBLISHED, responses.get(0).getStatus());
        assertEquals("John", responses.get(0).getFirstName());
    }
}
