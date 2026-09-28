package com.swarnikacare.patient.controller;

import com.swarnikacare.patient.dto.PatientCreateRequest;
import com.swarnikacare.patient.dto.PatientResponse;
import com.swarnikacare.patient.dto.PatientUpdateRequest;
import com.swarnikacare.patient.entity.PatientStatus;
import com.swarnikacare.patient.exception.PatientNotFoundException;
import com.swarnikacare.patient.service.PatientService;
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
@RequestMapping("/api/v1/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // --- Staff / Admin endpoints ---

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE','DOCTOR')")
    public ResponseEntity<Map<String, Object>> getAllPatients() {
        List<PatientResponse> patients = patientService.getAllPatients();
        return ResponseEntity.ok(createSuccessResponse("Patients retrieved successfully", patients));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> createPatient(@Valid @RequestBody PatientCreateRequest request) {
        PatientResponse patient = patientService.createPatient(request);
        return new ResponseEntity<>(createSuccessResponse("Patient created successfully", patient), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or (hasAnyRole('HOSPITAL_ADMIN','RECEPTIONIST','NURSE','DOCTOR') and @scopeValidator.canAccessPatient(authentication, #id))")
    public ResponseEntity<Map<String, Object>> getPatientById(@PathVariable Long id) {
        PatientResponse patient = patientService.getPatientById(id);
        return ResponseEntity.ok(createSuccessResponse("Patient retrieved successfully", patient));
    }

    /**
     * Staff-level full update. Requires elevated role.
     * Patients must use PATCH /me to update their own allowed fields.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or (hasAnyRole('HOSPITAL_ADMIN','RECEPTIONIST') and @scopeValidator.canAccessPatient(authentication, #id))")
    public ResponseEntity<Map<String, Object>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientUpdateRequest request) {
        PatientResponse patient = patientService.updatePatient(id, request);
        return ResponseEntity.ok(createSuccessResponse("Patient updated successfully", patient));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(createSuccessResponse("Patient deleted successfully", null));
    }

    // --- Patient self-service endpoints ---

    /**
     * Patient retrieves their own profile.
     * Identity is derived from the authenticated JWT — never trusted from request.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication authentication) {
        String userId = authentication.getName();
        PatientResponse patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(createSuccessResponse("Profile retrieved successfully", patient));
    }

    /**
     * Patient updates only allowed administrative fields.
     * Identity derived from JWT. Ownership enforced in service layer.
     * Cannot update: MRN, ID, userId, clinical fields, status.
     */
    @PatchMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> updateMyProfile(
            Authentication authentication,
            @RequestBody PatientSelfUpdateRequest request) {
        String userId = authentication.getName();
        PatientResponse patient = patientService.updateMyProfile(userId, request);
        return ResponseEntity.ok(createSuccessResponse("Profile updated successfully", patient));
    }

    // --- Inner DTO for patient self-update (only allowed fields) ---
    public static class PatientSelfUpdateRequest {
        private String phone;
        private String address;
        private String emergencyContact;

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getEmergencyContact() { return emergencyContact; }
        public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
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
