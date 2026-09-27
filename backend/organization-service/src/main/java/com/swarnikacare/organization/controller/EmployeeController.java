package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.EmployeeRequest;
import com.swarnikacare.organization.dto.EmployeeUpdateRequest;
import com.swarnikacare.organization.dto.StaffDirectoryResponse;
import com.swarnikacare.organization.dto.StaffOnboardRequest;
import com.swarnikacare.organization.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    // --- Composite Staff Directory ---

    @GetMapping("/directory")
    @PreAuthorize("#hospitalId == null or @scopeValidator.canAccessHospital(authentication, #hospitalId)")
    public ResponseEntity<Map<String, Object>> getStaffDirectory(
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        // Enforce hospital scoping for HOSPITAL_ADMIN if hospitalId was not passed
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));

        Long targetHospitalId = hospitalId;
        if (!isSuperAdmin && targetHospitalId == null) {
            if (authentication.getDetails() instanceof Map) {
                Map<?, ?> details = (Map<?, ?>) authentication.getDetails();
                Object scopedHId = details.get("hospitalId");
                if (scopedHId != null) {
                    targetHospitalId = Long.valueOf(scopedHId.toString());
                }
            }
        }

        List<StaffDirectoryResponse> directory = service.getStaffDirectory(targetHospitalId, departmentId, role, status, search);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Staff directory retrieved successfully",
                "data", directory
        ));
    }

    // --- Single Staff Member Detail ---

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    public ResponseEntity<Map<String, Object>> getStaffById(@PathVariable Long id, Authentication authentication) {
        StaffDirectoryResponse staff = service.getStaffById(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Staff details retrieved successfully",
                "data", staff
        ));
    }

    // --- Staff Onboarding with IAM Provisioning ---

    @PostMapping("/onboard")
    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #request.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> onboardStaff(@Valid @RequestBody StaffOnboardRequest request) {
        StaffDirectoryResponse created = service.onboardStaff(request);
        return new ResponseEntity<>(Map.of(
                "success", true,
                "message", "Staff member onboarded successfully",
                "data", created
        ), HttpStatus.CREATED);
    }

    // --- Staff Update ---

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStaff(
            @PathVariable Long id,
            @RequestBody EmployeeUpdateRequest request
    ) {
        StaffDirectoryResponse updated = service.updateStaff(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Staff details updated successfully",
                "data", updated
        ));
    }

    // --- Staff Status Mutation ---

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, String> payload
    ) {
        String targetStatus = status;
        if ((targetStatus == null || targetStatus.trim().isEmpty()) && payload != null) {
            targetStatus = payload.get("status");
        }
        if (targetStatus == null || targetStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }
        StaffDirectoryResponse updated = service.updateStatus(id, targetStatus);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Staff status updated successfully",
                "data", updated
        ));
    }

    // --- Staff Deactivation / Deletion ---

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteStaff(@PathVariable Long id) {
        service.deleteStaff(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Staff member deactivated successfully"
        ));
    }

    // --- Legacy / Backward Compatible Endpoints ---

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        return ResponseEntity.ok(Map.of("success", true, "data", service.getAll()));
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody EmployeeRequest payload) {
        return ResponseEntity.ok(Map.of("success", true, "data", service.create(payload)));
    }
}
