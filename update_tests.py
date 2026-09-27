import os
from pathlib import Path

new_employee_test = """package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.EmployeeRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.entity.Employee;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.entity.Position;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.DesignationRepository;
import com.swarnikacare.organization.repository.EmployeeRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import com.swarnikacare.organization.repository.PositionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class EmployeeServiceTest {
    @Mock private EmployeeRepository repository;
    @Mock private HospitalRepository hospitalRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private DesignationRepository designationRepository;
    @Mock private PositionRepository positionRepository;

    @InjectMocks private EmployeeService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_Success() {
        EmployeeRequest req = new EmployeeRequest();
        req.setUserId("user123");
        req.setEmployeeCode("EMP001");
        req.setHospitalId(1L);
        req.setDepartmentId(1L);
        req.setDesignationId(1L);
        req.setPositionId(1L);
        req.setReportingManagerId(2L);
        req.setJoiningDate(LocalDate.now());
        req.setEmploymentType("FULL_TIME");

        when(repository.findByUserId("user123")).thenReturn(Optional.empty());
        
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
        
        Position p = new Position();
        p.setId(1L);
        p.setHospitalId(1L);
        p.setDepartmentId(1L);
        when(positionRepository.findById(1L)).thenReturn(Optional.of(p));
        
        Employee manager = new Employee();
        manager.setId(2L);
        manager.setHospitalId(1L);
        when(repository.findById(2L)).thenReturn(Optional.of(manager));

        Employee saved = new Employee();
        saved.setUserId("user123");
        saved.setEmployeeCode("EMP001");
        saved.setHospitalId(1L);
        saved.setStatus("ACTIVE");

        when(repository.save(any(Employee.class))).thenReturn(saved);

        Employee result = service.create(req);
        assertNotNull(result);
        assertEquals("user123", result.getUserId());
        assertEquals("EMP001", result.getEmployeeCode());
        assertEquals(1L, result.getHospitalId());
        assertEquals("ACTIVE", result.getStatus());
    }

    @Test
    void create_DuplicateUserId_ThrowsException() {
        EmployeeRequest req = new EmployeeRequest();
        req.setUserId("user123");
        when(repository.findByUserId("user123")).thenReturn(Optional.of(new Employee()));
        assertThrows(RuntimeException.class, () -> service.create(req));
    }
    
    @Test
    void create_CrossHospitalDepartment_ThrowsException() {
        EmployeeRequest req = new EmployeeRequest();
        req.setUserId("user123");
        req.setHospitalId(1L);
        req.setDepartmentId(2L); // Department belongs to hospital 2
        
        when(repository.findByUserId("user123")).thenReturn(Optional.empty());
        
        Hospital h = new Hospital();
        h.setId(1L);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(h));
        
        Department d = new Department();
        d.setId(2L);
        d.setHospitalId(2L); // belongs to a different hospital
        when(departmentRepository.findById(2L)).thenReturn(Optional.of(d));
        
        Exception exception = assertThrows(RuntimeException.class, () -> service.create(req));
        assertEquals("Department does not belong to the hospital", exception.getMessage());
    }
}
"""

new_position_test = """package com.swarnikacare.organization.service;

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
"""

Path("backend/organization-service/src/test/java/com/swarnikacare/organization/service/EmployeeServiceTest.java").write_text(new_employee_test)
Path("backend/organization-service/src/test/java/com/swarnikacare/organization/service/PositionServiceTest.java").write_text(new_position_test)
print("Updated tests.")
