import os
import textwrap

BASE_DIR = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend/organization-service/src/main/java/com/swarnikacare/organization"

def write_file(subpath, content):
    full_path = os.path.join(BASE_DIR, subpath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(textwrap.dedent(content).strip() + "\n")

# DTOs
write_file("dto/DesignationRequest.java", """
package com.swarnikacare.organization.dto;

public class DesignationRequest {
    private String code;
    private String name;
    private String description;
    private String functionalArea;
    private Boolean active;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFunctionalArea() { return functionalArea; }
    public void setFunctionalArea(String functionalArea) { this.functionalArea = functionalArea; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
""")

write_file("dto/PositionRequest.java", """
package com.swarnikacare.organization.dto;

public class PositionRequest {
    private Long hospitalId;
    private Long departmentId;
    private Long designationId;
    private String code;
    private String title;
    private String description;
    private Long reportsToPositionId;
    private String status;

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public Long getDesignationId() { return designationId; }
    public void setDesignationId(Long designationId) { this.designationId = designationId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getReportsToPositionId() { return reportsToPositionId; }
    public void setReportsToPositionId(Long reportsToPositionId) { this.reportsToPositionId = reportsToPositionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
""")

write_file("dto/EmployeeRequest.java", """
package com.swarnikacare.organization.dto;

import java.time.LocalDate;

public class EmployeeRequest {
    private String userId;
    private String employeeCode;
    private Long hospitalId;
    private Long departmentId;
    private Long designationId;
    private Long positionId;
    private Long reportingManagerId;
    private LocalDate joiningDate;
    private String employmentType;
    private String status;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public Long getDesignationId() { return designationId; }
    public void setDesignationId(Long designationId) { this.designationId = designationId; }
    public Long getPositionId() { return positionId; }
    public void setPositionId(Long positionId) { this.positionId = positionId; }
    public Long getReportingManagerId() { return reportingManagerId; }
    public void setReportingManagerId(Long reportingManagerId) { this.reportingManagerId = reportingManagerId; }
    public LocalDate getJoiningDate() { return joiningDate; }
    public void setJoiningDate(LocalDate joiningDate) { this.joiningDate = joiningDate; }
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
""")

# Services
write_file("service/DesignationService.java", """
package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.DesignationRequest;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.repository.DesignationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DesignationService {
    private final DesignationRepository repository;

    public DesignationService(DesignationRepository repository) {
        this.repository = repository;
    }

    public List<Designation> getAll() {
        return repository.findAll();
    }

    public Designation create(DesignationRequest request) {
        if(repository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Designation code already exists");
        }
        Designation d = new Designation();
        d.setCode(request.getCode());
        d.setName(request.getName());
        d.setDescription(request.getDescription());
        d.setFunctionalArea(request.getFunctionalArea());
        d.setActive(request.getActive() != null ? request.getActive() : true);
        return repository.save(d);
    }
}
""")

write_file("service/PositionService.java", """
package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.PositionRequest;
import com.swarnikacare.organization.entity.Position;
import com.swarnikacare.organization.repository.PositionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PositionService {
    private final PositionRepository repository;

    public PositionService(PositionRepository repository) {
        this.repository = repository;
    }

    public List<Position> getAll() {
        return repository.findAll();
    }

    public List<Position> getByHospitalId(Long hospitalId) {
        return repository.findByHospitalId(hospitalId);
    }

    public Position create(PositionRequest request) {
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
""")

write_file("service/EmployeeService.java", """
package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.EmployeeRequest;
import com.swarnikacare.organization.entity.Employee;
import com.swarnikacare.organization.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
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
""")

# Controllers
write_file("controller/DesignationController.java", """
package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.DesignationRequest;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.service.DesignationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/designations")
public class DesignationController {
    private final DesignationService service;

    public DesignationController(DesignationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        return ResponseEntity.ok(Map.of("success", true, "data", service.getAll()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody DesignationRequest request) {
        return ResponseEntity.ok(Map.of("success", true, "data", service.create(request)));
    }
}
""")

write_file("controller/PositionController.java", """
package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.PositionRequest;
import com.swarnikacare.organization.entity.Position;
import com.swarnikacare.organization.service.PositionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/positions")
public class PositionController {
    private final PositionService service;

    public PositionController(PositionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        return ResponseEntity.ok(Map.of("success", true, "data", service.getAll()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody PositionRequest request) {
        return ResponseEntity.ok(Map.of("success", true, "data", service.create(request)));
    }
}
""")

write_file("controller/EmployeeController.java", """
package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.EmployeeRequest;
import com.swarnikacare.organization.entity.Employee;
import com.swarnikacare.organization.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {
    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        return ResponseEntity.ok(Map.of("success", true, "data", service.getAll()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(Map.of("success", true, "data", service.create(request)));
    }
}
""")

# Also need scoped endpoints in existing HospitalController or create new one.
# For simplicity, add scoping routes in PositionController and EmployeeController.
write_file("controller/HospitalScopeController.java", """
package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.service.EmployeeService;
import com.swarnikacare.organization.service.PositionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/hospitals/{hospitalId}")
public class HospitalScopeController {
    private final EmployeeService employeeService;
    private final PositionService positionService;

    public HospitalScopeController(EmployeeService employeeService, PositionService positionService) {
        this.employeeService = employeeService;
        this.positionService = positionService;
    }

    @GetMapping("/employees")
    public ResponseEntity<Map<String, Object>> getEmployees(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(Map.of("success", true, "data", employeeService.getByHospitalId(hospitalId)));
    }

    @GetMapping("/positions")
    public ResponseEntity<Map<String, Object>> getPositions(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(Map.of("success", true, "data", positionService.getByHospitalId(hospitalId)));
    }
}
""")

