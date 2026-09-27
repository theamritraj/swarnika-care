package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.DepartmentCreateRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private HospitalRepository hospitalRepository;

    @InjectMocks
    private DepartmentService departmentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createDepartment_Success() {
        DepartmentCreateRequest request = new DepartmentCreateRequest();
        request.setHospitalId(1L);
        request.setCode("DEP-CARDIO");
        request.setName("Cardiology");
        request.setDescription("Heart and Vascular");
        request.setHeadDoctorId(5L);
        request.setPublicVisibility(true);

        Hospital hospital = new Hospital();
        hospital.setId(1L);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));
        when(departmentRepository.findByCode("DEP-CARDIO")).thenReturn(Optional.empty());

        Department saved = new Department();
        saved.setId(20L);
        saved.setHospitalId(1L);
        saved.setCode("DEP-CARDIO");
        saved.setName("Cardiology");
        saved.setStatus("ACTIVE");

        when(departmentRepository.save(any(Department.class))).thenReturn(saved);

        Department result = departmentService.createDepartment(request);

        assertNotNull(result);
        assertEquals(20L, result.getId());
        assertEquals("DEP-CARDIO", result.getCode());
        assertEquals(1L, result.getHospitalId());
        assertEquals("ACTIVE", result.getStatus());
    }

    @Test
    void createDepartment_HospitalNotFound_ThrowsException() {
        DepartmentCreateRequest request = new DepartmentCreateRequest();
        request.setHospitalId(999L);
        request.setCode("DEP-NEURO");

        when(hospitalRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> departmentService.createDepartment(request));
        assertEquals("Hospital not found", ex.getMessage());
    }

    @Test
    void createDepartment_DuplicateCode_ThrowsException() {
        DepartmentCreateRequest request = new DepartmentCreateRequest();
        request.setHospitalId(1L);
        request.setCode("DEP-DUP");

        Hospital hospital = new Hospital();
        hospital.setId(1L);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(hospital));

        Department existing = new Department();
        existing.setId(2L);
        existing.setCode("DEP-DUP");
        when(departmentRepository.findByCode("DEP-DUP")).thenReturn(Optional.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> departmentService.createDepartment(request));
        assertEquals("Department code already exists", ex.getMessage());
    }

    @Test
    void updateDepartment_Success() {
        Department existing = new Department();
        existing.setId(20L);
        existing.setCode("DEP-CARDIO");
        existing.setName("Cardiology");

        when(departmentRepository.findById(20L)).thenReturn(Optional.of(existing));
        when(departmentRepository.save(any(Department.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DepartmentCreateRequest updateReq = new DepartmentCreateRequest();
        updateReq.setName("Cardiology & Electrophysiology");
        updateReq.setDescription("Expanded cardiac care");

        Department updated = departmentService.updateDepartment(20L, updateReq);

        assertNotNull(updated);
        assertEquals("Cardiology & Electrophysiology", updated.getName());
        assertEquals("Expanded cardiac care", updated.getDescription());
    }
}
