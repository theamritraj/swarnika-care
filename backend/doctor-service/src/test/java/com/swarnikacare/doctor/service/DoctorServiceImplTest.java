package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.DoctorProvisionRequest;
import com.swarnikacare.doctor.client.IamClient;
import com.swarnikacare.doctor.client.UserResponse;
import com.swarnikacare.doctor.dto.DoctorCreateRequest;
import com.swarnikacare.doctor.dto.DoctorDirectoryResponse;
import com.swarnikacare.doctor.dto.DoctorResponse;
import com.swarnikacare.doctor.entity.Doctor;
import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import com.swarnikacare.doctor.entity.DoctorProfile;
import com.swarnikacare.doctor.entity.PublicProfileStatus;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.repository.DoctorProfileRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DoctorServiceImplTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private IamClient iamClient;

    @Mock
    private DoctorProfileRepository profileRepository;

    @Mock
    private DoctorHospitalAssignmentRepository assignmentRepository;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateDoctor_Success() {
        DoctorCreateRequest request = new DoctorCreateRequest();
        request.setEmail("test@swarnikacare.com");
        request.setFirstName("John");
        request.setLastName("Doe");

        UserResponse mockUser = new UserResponse();
        mockUser.setId(1025L);
        when(iamClient.provisionDoctor(any(DoctorProvisionRequest.class))).thenReturn(mockUser);

        Doctor savedDoctor = new Doctor();
        savedDoctor.setId(1L);
        savedDoctor.setUserId("1025");
        savedDoctor.setEmail("test@swarnikacare.com");
        when(doctorRepository.save(any(Doctor.class))).thenReturn(savedDoctor);

        DoctorResponse response = doctorService.createDoctor(request);

        assertNotNull(response);
        assertEquals("1025", response.getUserId());
        verify(iamClient, times(1)).provisionDoctor(any(DoctorProvisionRequest.class));
        verify(doctorRepository, times(1)).save(any(Doctor.class));
        verify(iamClient, never()).deleteUser(anyLong());
    }

    @Test
    void testCreateDoctor_IamFailure() {
        DoctorCreateRequest request = new DoctorCreateRequest();
        request.setEmail("test@swarnikacare.com");

        when(iamClient.provisionDoctor(any(DoctorProvisionRequest.class)))
                .thenThrow(new RuntimeException("IAM Unavailable"));

        assertThrows(RuntimeException.class, () -> doctorService.createDoctor(request));
        
        verify(iamClient, times(1)).provisionDoctor(any());
        verify(doctorRepository, never()).save(any());
    }

    @Test
    void testCreateDoctor_DoctorSaveFailure_CompensatesIam() {
        DoctorCreateRequest request = new DoctorCreateRequest();
        request.setEmail("test@swarnikacare.com");

        UserResponse mockUser = new UserResponse();
        mockUser.setId(1025L);
        when(iamClient.provisionDoctor(any(DoctorProvisionRequest.class))).thenReturn(mockUser);

        when(doctorRepository.save(any(Doctor.class))).thenThrow(new RuntimeException("DB Error"));

        assertThrows(RuntimeException.class, () -> doctorService.createDoctor(request));

        verify(iamClient, times(1)).provisionDoctor(any());
        verify(doctorRepository, times(1)).save(any());
        verify(iamClient, times(1)).deleteUser(1025L); // Compensation triggered!
    }

    @Test
    void testGetDoctorDirectory_Success() {
        Doctor doc = new Doctor();
        doc.setId(1L);
        doc.setFirstName("Rajesh");
        doc.setLastName("Sharma");
        doc.setEmail("rajesh@swarnikacare.com");
        doc.setStatus("ACTIVE");

        when(doctorRepository.findAll()).thenReturn(List.of(doc));

        DoctorProfile profile = new DoctorProfile();
        profile.setSpecializations("Cardiology");
        profile.setStatus(PublicProfileStatus.PUBLISHED);
        when(profileRepository.findByDoctorId(1L)).thenReturn(Optional.of(profile));

        DoctorHospitalAssignment assignment = new DoctorHospitalAssignment();
        assignment.setId(10L);
        assignment.setDoctorId(1L);
        assignment.setHospitalId(101L);
        assignment.setDepartmentId(101L);
        assignment.setDesignation("Senior Consultant");
        when(assignmentRepository.findByDoctorId(1L)).thenReturn(List.of(assignment));

        List<DoctorDirectoryResponse> dir = doctorService.getDoctorDirectory(null, null, "rajesh");

        assertNotNull(dir);
        assertEquals(1, dir.size());
        assertEquals("Rajesh", dir.get(0).getFirstName());
        assertEquals("Cardiology", dir.get(0).getSpecialization());
        assertEquals(1, dir.get(0).getAssignments().size());
        assertEquals(101L, dir.get(0).getAssignments().get(0).getHospitalId());
    }
}
