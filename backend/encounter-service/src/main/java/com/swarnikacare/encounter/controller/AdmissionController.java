package com.swarnikacare.encounter.controller;

import com.swarnikacare.encounter.client.PatientClient;
import com.swarnikacare.encounter.dto.AdmissionRequest;
import com.swarnikacare.encounter.dto.AdmissionResponse;
import com.swarnikacare.encounter.entity.AdmissionStatus;
import com.swarnikacare.encounter.service.AdmissionService;
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
@RequestMapping("/api/v1/admissions")
public class AdmissionController {

    private final AdmissionService admissionService;
    private final PatientClient patientClient;

    public AdmissionController(AdmissionService admissionService, PatientClient patientClient) {
        this.admissionService = admissionService;
        this.patientClient = patientClient;
    }

    // ─── Staff / Clinical Endpoints ───────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Map<String, Object>> createAdmission(
            @Valid @RequestBody AdmissionRequest request,
            Authentication authentication) {
        String staffUserId = authentication != null ? authentication.getName() : "SYSTEM";
        AdmissionResponse admission = admissionService.createAdmission(request, staffUserId);
        return new ResponseEntity<>(ok("Inpatient admission initiated successfully", admission), HttpStatus.CREATED);
    }

    /**
     * Staff-only: query admissions by hospitalId/patientId filter params.
     * PATIENT role must use /me/admissions instead.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Map<String, Object>> getAdmissions(
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) AdmissionStatus status) {
        List<AdmissionResponse> admissions = admissionService.getAdmissions(hospitalId, patientId, status);
        return ResponseEntity.ok(ok("Admissions retrieved successfully", admissions));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Map<String, Object>> getAdmissionById(@PathVariable Long id) {
        AdmissionResponse admission = admissionService.getAdmissionById(id);
        return ResponseEntity.ok(ok("Admission retrieved successfully", admission));
    }

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) AdmissionStatus status,
            @RequestParam(required = false) Long bedId,
            @RequestParam(required = false) String notes) {
        AdmissionResponse admission = admissionService.updateAdmissionStatus(id, status, bedId, notes);
        return ResponseEntity.ok(ok("Admission status updated successfully", admission));
    }

    // ─── Patient Self-Service ─────────────────────────────────────────────────

    /**
     * Patient: get own admissions only.
     * PatientId resolved from JWT — never from URL/query param.
     * Read-only. Patient cannot modify admission state.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyAdmissions(Authentication auth) {
        Long patientId = resolvePatientId(auth);
        List<AdmissionResponse> admissions = admissionService.getAdmissions(null, patientId, null);
        return ResponseEntity.ok(ok("Your admissions retrieved successfully", admissions));
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Long resolvePatientId(Authentication auth) {
        if (auth == null) throw new AccessDeniedException("Unauthorized");
        try {
            Map<String, Object> resp = patientClient.getPatientMe(auth.getName());
            Object data = resp.get("data");
            if (data instanceof Map) {
                Object id = ((Map<String, Object>) data).get("id");
                if (id instanceof Number) return ((Number) id).longValue();
            }
        } catch (Exception e) {
            throw new AccessDeniedException("Could not resolve patient identity");
        }
        throw new AccessDeniedException("Patient identity could not be resolved");
    }

    private Map<String, Object> ok(String message, Object data) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", message);
        if (data != null) r.put("data", data);
        return r;
    }
}
