package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.PositionRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.entity.Position;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.DesignationRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import com.swarnikacare.organization.repository.PositionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class PositionServiceTest {
    @Mock private PositionRepository repository;
    @Mock private HospitalRepository hospitalRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private DesignationRepository designationRepository;

    @InjectMocks private PositionService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_Success() {
        PositionRequest req = new PositionRequest();
        req.setHospitalId(1L);
        req.setDepartmentId(1L);
        req.setDesignationId(1L);
        req.setCode("HOD_CARDIO");
        req.setTitle("HOD Cardiology");
        
        Hospital h = new Hospital();
        h.setId(1L);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(h));
        
        Department d = new Department();
        d.setId(1L);
        d.setHospitalId(1L);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(d));
        
        Designation desig = new Designation();
        desig.setId(1L);
        desig.setActive(true);
        when(designationRepository.findById(1L)).thenReturn(Optional.of(desig));

        Position saved = new Position();
        saved.setHospitalId(1L);
        saved.setCode("HOD_CARDIO");
        saved.setTitle("HOD Cardiology");
        saved.setStatus("ACTIVE");

        when(repository.save(any(Position.class))).thenReturn(saved);

        Position result = service.create(req);
        assertNotNull(result);
        assertEquals(1L, result.getHospitalId());
        assertEquals("HOD_CARDIO", result.getCode());
        assertEquals("ACTIVE", result.getStatus());
    }

    @Test
    void create_InvalidDepartmentHospital_ThrowsException() {
        PositionRequest req = new PositionRequest();
        req.setHospitalId(1L);
        req.setDepartmentId(1L);
        
        Hospital h = new Hospital();
        h.setId(1L);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(h));
        
        Department d = new Department();
        d.setId(1L);
        d.setHospitalId(2L); // mismatch
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(d));
        
        Exception exception = assertThrows(RuntimeException.class, () -> service.create(req));
        assertEquals("Department does not belong to the hospital", exception.getMessage());
    }
}
