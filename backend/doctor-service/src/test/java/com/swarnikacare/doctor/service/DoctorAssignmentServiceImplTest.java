package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.OrganizationClient;
import com.swarnikacare.doctor.dto.DoctorAssignmentRequest;
import com.swarnikacare.doctor.dto.DoctorAssignmentResponse;
import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import com.swarnikacare.doctor.exception.DoctorNotFoundException;
import com.swarnikacare.doctor.exception.DuplicateResourceException;
import com.swarnikacare.doctor.exception.InvalidHierarchyException;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DoctorAssignmentServiceImplTest {

    @Mock
    private DoctorHospitalAssignmentRepository assignmentRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private OrganizationClient organizationClient;

    @InjectMocks
    private DoctorAssignmentServiceImpl assignmentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    private Map<String, Object> createOrgResponse(Long id, Long hospitalId) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        Map<String, Object> data = new HashMap<>();
        data.put("id", id);
        if (hospitalId != null) {
            data.put("hospitalId", hospitalId);
        }
        resp.put("data", data);
        return resp;
    }

    @Test
    void testCreateAssignment_Success() {
        Long doctorId = 1L;
        DoctorAssignmentRequest req = new DoctorAssignmentRequest(101L, 101L, "Consultant", "ACTIVE", false, true);

        when(doctorRepository.existsById(doctorId)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(101L)).thenReturn(createOrgResponse(101L, 101L));
        when(assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(doctorId, 101L, 101L)).thenReturn(false);

        DoctorHospitalAssignment saved = new DoctorHospitalAssignment();
        saved.setId(10L);
        saved.setDoctorId(doctorId);
        saved.setHospitalId(101L);
        saved.setDepartmentId(101L);
        saved.setDesignation("Consultant");
        saved.setStatus("ACTIVE");
        when(assignmentRepository.save(any(DoctorHospitalAssignment.class))).thenReturn(saved);

        DoctorAssignmentResponse res = assignmentService.createAssignment(doctorId, req);

        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("Consultant", res.getDesignation());
        assertEquals("ACTIVE", res.getStatus());
        verify(assignmentRepository, times(1)).save(any(DoctorHospitalAssignment.class));
    }

    @Test
    void testCreateAssignment_DoctorNotFound() {
        when(doctorRepository.existsById(999L)).thenReturn(false);
        DoctorAssignmentRequest req = new DoctorAssignmentRequest(101L, 101L, "Consultant", "ACTIVE", false, true);

        assertThrows(DoctorNotFoundException.class, () -> assignmentService.createAssignment(999L, req));
    }

    @Test
    void testCreateAssignment_HospitalInvalid() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(999L)).thenReturn(null);
        DoctorAssignmentRequest req = new DoctorAssignmentRequest(999L, 101L, "Consultant", "ACTIVE", false, true);

        assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignment(1L, req));
    }

    @Test
    void testCreateAssignment_DepartmentInvalid() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(999L)).thenReturn(null);
        DoctorAssignmentRequest req = new DoctorAssignmentRequest(101L, 999L, "Consultant", "ACTIVE", false, true);

        assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignment(1L, req));
    }

    @Test
    void testCreateAssignment_DepartmentBelongsToAnotherHospital() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        // Department 102 belongs to Hospital 102, not 101
        when(organizationClient.getDepartmentById(102L)).thenReturn(createOrgResponse(102L, 102L));
        DoctorAssignmentRequest req = new DoctorAssignmentRequest(101L, 102L, "Consultant", "ACTIVE", false, true);

        assertThrows(InvalidHierarchyException.class, () -> assignmentService.createAssignment(1L, req));
    }

    @Test
    void testCreateAssignment_DuplicateAssignment() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        when(organizationClient.getHospitalById(101L)).thenReturn(createOrgResponse(101L, null));
        when(organizationClient.getDepartmentById(101L)).thenReturn(createOrgResponse(101L, 101L));
        when(assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(1L, 101L, 101L)).thenReturn(true);
        DoctorAssignmentRequest req = new DoctorAssignmentRequest(101L, 101L, "Consultant", "ACTIVE", false, true);

        assertThrows(DuplicateResourceException.class, () -> assignmentService.createAssignment(1L, req));
    }

    @Test
    void testGetAssignmentsByDoctor() {
        when(doctorRepository.existsById(1L)).thenReturn(true);
        DoctorHospitalAssignment a = new DoctorHospitalAssignment();
        a.setId(5L);
        a.setDoctorId(1L);
        a.setHospitalId(101L);
        a.setDepartmentId(101L);
        when(assignmentRepository.findByDoctorId(1L)).thenReturn(List.of(a));

        List<DoctorAssignmentResponse> res = assignmentService.getAssignmentsByDoctor(1L);
        assertEquals(1, res.size());
        assertEquals(5L, res.get(0).getId());
    }

    @Test
    void testGetAssignmentsByHospital() {
        DoctorHospitalAssignment a = new DoctorHospitalAssignment();
        a.setId(5L);
        a.setDoctorId(1L);
        a.setHospitalId(101L);
        a.setDepartmentId(101L);
        when(assignmentRepository.findByHospitalIdAndDepartmentId(101L, 101L)).thenReturn(List.of(a));

        List<DoctorAssignmentResponse> res = assignmentService.getAssignmentsByHospital(101L, 101L);
        assertEquals(1, res.size());
    }

    @Test
    void testDeleteAssignment() {
        DoctorHospitalAssignment a = new DoctorHospitalAssignment();
        a.setId(5L);
        when(assignmentRepository.findById(5L)).thenReturn(Optional.of(a));

        assignmentService.deleteAssignment(5L);
        verify(assignmentRepository, times(1)).delete(a);
    }
}
