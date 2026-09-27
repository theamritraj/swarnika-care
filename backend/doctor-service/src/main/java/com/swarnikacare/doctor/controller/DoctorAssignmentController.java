package com.swarnikacare.doctor.controller;

import com.swarnikacare.doctor.dto.DoctorAssignmentRequest;
import com.swarnikacare.doctor.dto.DoctorAssignmentResponse;
import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.security.ScopeValidator;
import com.swarnikacare.doctor.service.DoctorAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorAssignmentController {

    private final DoctorAssignmentService assignmentService;
    private final DoctorHospitalAssignmentRepository assignmentRepository;
    private final ScopeValidator scopeValidator;

    public DoctorAssignmentController(
            DoctorAssignmentService assignmentService,
            DoctorHospitalAssignmentRepository assignmentRepository,
            ScopeValidator scopeValidator) {
        this.assignmentService = assignmentService;
        this.assignmentRepository = assignmentRepository;
        this.scopeValidator = scopeValidator;
    }

    @GetMapping("/{doctorId}/assignments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    public ResponseEntity<Map<String, Object>> getAssignmentsByDoctor(@PathVariable Long doctorId) {
        List<DoctorAssignmentResponse> assignments = assignmentService.getAssignmentsByDoctor(doctorId);
        return ResponseEntity.ok(createSuccessResponse("Doctor assignments retrieved successfully", assignments));
    }

    @PostMapping("/{doctorId}/assignments")
    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #request.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> createAssignment(
            @PathVariable Long doctorId,
            @Valid @RequestBody DoctorAssignmentRequest request) {
        DoctorAssignmentResponse assignment = assignmentService.createAssignment(doctorId, request);
        return new ResponseEntity<>(createSuccessResponse("Doctor assigned to hospital successfully", assignment), HttpStatus.CREATED);
    }

    @GetMapping("/assignments")
    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAssignmentsByHospital(
            @RequestParam Long hospitalId,
            @RequestParam(required = false) Long departmentId) {
        List<DoctorAssignmentResponse> assignments = assignmentService.getAssignmentsByHospital(hospitalId, departmentId);
        return ResponseEntity.ok(createSuccessResponse("Hospital doctor assignments retrieved successfully", assignments));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAssignment(
            @PathVariable Long assignmentId,
            Authentication authentication) {
        DoctorHospitalAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + assignmentId));

        if (!scopeValidator.canAccessHospital(authentication, assignment.getHospitalId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to delete assignments for this hospital");
        }

        assignmentService.deleteAssignment(assignmentId);
        return ResponseEntity.ok(createSuccessResponse("Doctor assignment deleted successfully", null));
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
