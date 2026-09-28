package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.DepartmentCreateRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> createDepartment(@Valid @RequestBody DepartmentCreateRequest request) {
        Department department = departmentService.createDepartment(request);
        return new ResponseEntity<>(createSuccessResponse("Department created successfully", department), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> getAllDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(createSuccessResponse("Departments retrieved successfully", departments));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> getDepartmentById(@PathVariable Long id) {
        Department department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(createSuccessResponse("Department retrieved successfully", department));
    }

    @GetMapping("/hospital/{hospitalId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> getDepartmentsByHospital(@PathVariable Long hospitalId) {
        List<Department> departments = departmentService.getDepartmentsByHospital(hospitalId);
        return ResponseEntity.ok(createSuccessResponse("Departments retrieved successfully", departments));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateDepartment(@PathVariable Long id, @RequestBody DepartmentCreateRequest request) {
        Department department = departmentService.updateDepartment(id, request);
        return ResponseEntity.ok(createSuccessResponse("Department updated successfully", department));
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null) {
            response.put("data", data);
        }
        return response;
    }
}
