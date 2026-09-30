import os
from pathlib import Path

BASE_DIR = "backend/organization-service/src/main/java/com/swarnikacare/organization"

def write_file(subpath, content):
    full_path = os.path.join(BASE_DIR, subpath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip() + "\n")

# 1. ScopeValidator
write_file("security/ScopeValidator.java", """
package com.swarnikacare.organization.security;

import com.swarnikacare.organization.entity.Employee;
import com.swarnikacare.organization.repository.EmployeeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("scopeValidator")
public class ScopeValidator {

    private final EmployeeRepository employeeRepository;

    public ScopeValidator(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public boolean canAccessHospital(Authentication authentication, Long hospitalId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin) {
            return true;
        }

        String userId = authentication.getName(); // subject is userId
        Optional<Employee> empOpt = employeeRepository.findByUserId(userId);
        if (empOpt.isPresent()) {
            return empOpt.get().getHospitalId().equals(hospitalId);
        }

        return false;
    }
}
""")

# 2. Update Controllers to add @PreAuthorize

def update_file(subpath, update_fn):
    path = Path(os.path.join(BASE_DIR, subpath))
    content = path.read_text()
    path.write_text(update_fn(content))

def update_hospital_scope_controller(content):
    content = content.replace("package com.swarnikacare.organization.controller;", "package com.swarnikacare.organization.controller;\\nimport org.springframework.security.access.prepost.PreAuthorize;")
    content = content.replace('@GetMapping("/employees")', '@PreAuthorize("@scopeValidator.canAccessHospital(authentication, #hospitalId)")\\n    @GetMapping("/employees")')
    content = content.replace('@GetMapping("/positions")', '@PreAuthorize("@scopeValidator.canAccessHospital(authentication, #hospitalId)")\\n    @GetMapping("/positions")')
    return content

update_file("controller/HospitalScopeController.java", update_hospital_scope_controller)

def update_employee_controller(content):
    content = content.replace("package com.swarnikacare.organization.controller;", "package com.swarnikacare.organization.controller;\nimport org.springframework.security.access.prepost.PreAuthorize;")
    content = content.replace("@PostMapping", '@PreAuthorize("@scopeValidator.canAccessHospital(authentication, #request.hospitalId) and hasAnyRole(\'SUPER_ADMIN\', \'HOSPITAL_ADMIN\', \'OPERATIONS_MANAGER\')")\n    @PostMapping')
    content = content.replace("@GetMapping\n    public ResponseEntity", '@PreAuthorize("hasRole(\'SUPER_ADMIN\')")\n    @GetMapping\n    public ResponseEntity')
    return content
update_file("controller/EmployeeController.java", update_employee_controller)

def update_position_controller(content):
    content = content.replace("package com.swarnikacare.organization.controller;", "package com.swarnikacare.organization.controller;\nimport org.springframework.security.access.prepost.PreAuthorize;")
    content = content.replace("@PostMapping", '@PreAuthorize("@scopeValidator.canAccessHospital(authentication, #request.hospitalId) and hasAnyRole(\'SUPER_ADMIN\', \'HOSPITAL_ADMIN\', \'OPERATIONS_MANAGER\')")\n    @PostMapping')
    content = content.replace("@GetMapping\n    public ResponseEntity", '@PreAuthorize("hasRole(\'SUPER_ADMIN\')")\n    @GetMapping\n    public ResponseEntity')
    return content
update_file("controller/PositionController.java", update_position_controller)

def update_designation_controller(content):
    content = content.replace("package com.swarnikacare.organization.controller;", "package com.swarnikacare.organization.controller;\nimport org.springframework.security.access.prepost.PreAuthorize;")
    content = content.replace("@PostMapping", '@PreAuthorize("hasAnyRole(\'SUPER_ADMIN\', \'HOSPITAL_ADMIN\')")\n    @PostMapping')
    return content
update_file("controller/DesignationController.java", update_designation_controller)

# 3. Validations in Services

new_employee_service = """
package com.swarnikacare.organization.service;

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
        
        // 3. hospitalId exists
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
            .orElseThrow(() -> new RuntimeException("Hospital not found"));
            
        // 4 & 5. department exists and belongs to hospital
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
            if (!dept.getHospitalId().equals(hospital.getId())) {
                throw new RuntimeException("Department does not belong to the hospital");
            }
        }
        
        // 6 & 7. designation exists and is active
        if (request.getDesignationId() != null) {
            Designation desig = designationRepository.findById(request.getDesignationId())
                .orElseThrow(() -> new RuntimeException("Designation not found"));
            if (!desig.getActive()) {
                throw new RuntimeException("Designation is inactive");
            }
        }
        
        // 8, 9, 10. position exists, belongs to same hospital, and department
        if (request.getPositionId() != null) {
            Position pos = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new RuntimeException("Position not found"));
            if (!pos.getHospitalId().equals(hospital.getId())) {
                throw new RuntimeException("Position does not belong to the hospital");
            }
            if (request.getDepartmentId() != null && !pos.getDepartmentId().equals(request.getDepartmentId())) {
                throw new RuntimeException("Position does not belong to the requested department");
            }
        }
        
        // 12, 13, 14. reporting manager
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
write_file("service/EmployeeService.java", new_employee_service)

new_position_service = """
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
        if (!desig.getActive()) {
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
write_file("service/PositionService.java", new_position_service)

print("Done")
