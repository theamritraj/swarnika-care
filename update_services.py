import os
from pathlib import Path

new_employee_service = """package com.swarnikacare.organization.service;

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
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository repository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final PositionRepository positionRepository;

    public EmployeeService(EmployeeRepository repository,
                           HospitalRepository hospitalRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository,
                           PositionRepository positionRepository) {
        this.repository = repository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.positionRepository = positionRepository;
    }

    public List<Employee> getAll() {
        return repository.findAll();
    }

    public List<Employee> getByHospitalId(Long hospitalId) {
        return repository.findByHospitalId(hospitalId);
    }

    public Employee create(EmployeeRequest request) {
        if(repository.findByUserId(request.getUserId()).isPresent()) {
            throw new RuntimeException("Employee for user already exists");
        }
        
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
            .orElseThrow(() -> new RuntimeException("Hospital not found"));
            
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
            if (!dept.getHospitalId().equals(hospital.getId())) {
                throw new RuntimeException("Department does not belong to the hospital");
            }
        }
        
        if (request.getDesignationId() != null) {
            Designation desig = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new RuntimeException("Designation not found"));
            if (desig.getActive() != null && !desig.getActive()) {
                throw new RuntimeException("Designation is inactive");
            }
        }
        
        if (request.getPositionId() != null) {
            Position pos = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found"));
            if (!pos.getHospitalId().equals(hospital.getId())) {
                throw new RuntimeException("Position does not belong to the hospital");
            }
            if (request.getDepartmentId() != null && pos.getDepartmentId() != null && !pos.getDepartmentId().equals(request.getDepartmentId())) {
                throw new RuntimeException("Position does not belong to the requested department");
            }
        }
        
        if (request.getReportingManagerId() != null) {
            Employee manager = repository.findById(request.getReportingManagerId())
                .orElseThrow(() -> new RuntimeException("Reporting manager not found"));
            if (!manager.getHospitalId().equals(hospital.getId())) {
                throw new RuntimeException("Reporting manager does not belong to the same hospital");
            }
        }

        Employee e = new Employee();
        e.setUserId(request.getUserId());
        e.setEmployeeCode(request.getEmployeeCode());
        e.setHospitalId(request.getHospitalId());
        e.setDepartmentId(request.getDepartmentId());
        e.setDesignationId(request.getDesignationId());
        e.setPositionId(request.getPositionId());
        e.setReportingManagerId(request.getReportingManagerId());
        e.setJoiningDate(request.getJoiningDate());
        e.setEmploymentType(request.getEmploymentType());
        e.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return repository.save(e);
    }
}
"""

new_position_service = """package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.PositionRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.entity.Position;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.DesignationRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import com.swarnikacare.organization.repository.PositionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PositionService {
    private final PositionRepository repository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    public PositionService(PositionRepository repository,
                           HospitalRepository hospitalRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository) {
        this.repository = repository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
    }

    public List<Position> getAll() {
        return repository.findAll();
    }

    public List<Position> getByHospitalId(Long hospitalId) {
        return repository.findByHospitalId(hospitalId);
    }

    public Position create(PositionRequest request) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
            .orElseThrow(() -> new RuntimeException("Hospital not found"));
            
        Department dept = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));
        if (!dept.getHospitalId().equals(hospital.getId())) {
            throw new RuntimeException("Department does not belong to the hospital");
        }
        
        Designation desig = designationRepository.findById(request.getDesignationId())
            .orElseThrow(() -> new RuntimeException("Designation not found"));
        if (desig.getActive() != null && !desig.getActive()) {
            throw new RuntimeException("Designation is inactive");
        }
        
        if (request.getReportsToPositionId() != null) {
            Position mgrPos = repository.findById(request.getReportsToPositionId())
                .orElseThrow(() -> new RuntimeException("Reporting position not found"));
            if (!mgrPos.getHospitalId().equals(hospital.getId())) {
                throw new RuntimeException("Reporting position does not belong to the same hospital");
            }
        }

        Position p = new Position();
        p.setHospitalId(request.getHospitalId());
        p.setDepartmentId(request.getDepartmentId());
        p.setDesignationId(request.getDesignationId());
        p.setCode(request.getCode());
        p.setTitle(request.getTitle());
        p.setDescription(request.getDescription());
        p.setReportsToPositionId(request.getReportsToPositionId());
        p.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return repository.save(p);
    }
}
"""

Path("backend/organization-service/src/main/java/com/swarnikacare/organization/service/EmployeeService.java").write_text(new_employee_service)
Path("backend/organization-service/src/main/java/com/swarnikacare/organization/service/PositionService.java").write_text(new_position_service)
print("Updated services.")
