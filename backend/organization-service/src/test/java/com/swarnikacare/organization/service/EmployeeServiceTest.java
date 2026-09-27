package com.swarnikacare.organization.service;

import com.swarnikacare.organization.client.IamClient;
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
    @Mock private IamClient iamClient;

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

    @Test
    void onboardStaff_Success() {
        com.swarnikacare.organization.dto.StaffOnboardRequest req = new com.swarnikacare.organization.dto.StaffOnboardRequest();
        req.setEmail("nurse.test@swarnika.com");
        req.setRole("NURSE");
        req.setEmployeeCode("STF001");
        req.setHospitalId(1L);
        req.setDepartmentId(1L);
        req.setDesignationId(1L);
        req.setEmploymentType("FULL_TIME");
        req.setJoiningDate(LocalDate.now());

        when(repository.existsByEmployeeCode("STF001")).thenReturn(false);

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

        com.swarnikacare.organization.client.dto.IamUserResponse iamUser = new com.swarnikacare.organization.client.dto.IamUserResponse();
        iamUser.setId(1001L);
        iamUser.setEmail("nurse.test@swarnika.com");
        iamUser.setRole("NURSE");
        iamUser.setStatus("ACTIVE");
        when(iamClient.provisionStaff(any(com.swarnikacare.organization.client.dto.StaffProvisionRequest.class))).thenReturn(iamUser);

        when(repository.save(any(Employee.class))).thenAnswer(inv -> {
            Employee e = inv.getArgument(0);
            e.setId(10L);
            return e;
        });

        com.swarnikacare.organization.dto.StaffDirectoryResponse resp = service.onboardStaff(req);
        assertNotNull(resp);
        assertEquals("1001", resp.getUserId());
        assertEquals("nurse.test@swarnika.com", resp.getEmail());
        assertEquals("NURSE", resp.getRole());
        assertEquals("STF001", resp.getEmployeeCode());
        assertEquals(1L, resp.getHospitalId());
    }

    @Test
    void onboardStaff_RollbackOnPersistenceFailure() {
        com.swarnikacare.organization.dto.StaffOnboardRequest req = new com.swarnikacare.organization.dto.StaffOnboardRequest();
        req.setEmail("nurse.fail@swarnika.com");
        req.setRole("NURSE");
        req.setEmployeeCode("STF002");
        req.setHospitalId(1L);

        when(repository.existsByEmployeeCode("STF002")).thenReturn(false);

        Hospital h = new Hospital();
        h.setId(1L);
        when(hospitalRepository.findById(1L)).thenReturn(Optional.of(h));

        com.swarnikacare.organization.client.dto.IamUserResponse iamUser = new com.swarnikacare.organization.client.dto.IamUserResponse();
        iamUser.setId(9999L);
        iamUser.setEmail("nurse.fail@swarnika.com");
        iamUser.setRole("NURSE");
        when(iamClient.provisionStaff(any(com.swarnikacare.organization.client.dto.StaffProvisionRequest.class))).thenReturn(iamUser);

        when(repository.save(any(Employee.class))).thenThrow(new RuntimeException("DB Disk Full"));

        assertThrows(RuntimeException.class, () -> service.onboardStaff(req));
        org.mockito.Mockito.verify(iamClient).deleteUser(9999L);
    }
}
