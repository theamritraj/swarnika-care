package com.swarnikacare.encounter.controller;

import com.swarnikacare.encounter.client.PatientClient;
import com.swarnikacare.encounter.dto.ReferralRequest;
import com.swarnikacare.encounter.dto.ReferralResponse;
import com.swarnikacare.encounter.entity.ReferralStatus;
import com.swarnikacare.encounter.service.ReferralService;
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
@RequestMapping("/api/v1/referrals")
public class ReferralController {

    private final ReferralService referralService;
    private final PatientClient patientClient;

    public ReferralController(ReferralService referralService, PatientClient patientClient) {
        this.referralService = referralService;
        this.patientClient = patientClient;
    }

    // ─── Staff / Clinical Endpoints ───────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR')")
    public ResponseEntity<Map<String, Object>> createReferral(@Valid @RequestBody ReferralRequest request) {
        ReferralResponse referral = referralService.createReferral(request);
        return new ResponseEntity<>(ok("Referral created successfully", referral), HttpStatus.CREATED);
    }

    /**
     * Staff-only: filter by patientId/hospitalId/status query params.
     * PATIENT role must use GET /me/referrals.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR')")
    public ResponseEntity<Map<String, Object>> getReferrals(
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) ReferralStatus status) {
        List<ReferralResponse> referrals = referralService.getReferrals(hospitalId, patientId, status);
        return ResponseEntity.ok(ok("Referrals retrieved successfully", referrals));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR')")
    public ResponseEntity<Map<String, Object>> getReferralById(@PathVariable Long id) {
        ReferralResponse referral = referralService.getReferralById(id);
        return ResponseEntity.ok(ok("Referral retrieved successfully", referral));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) ReferralStatus status,
            @RequestParam(required = false) Long appointmentId,
            @RequestParam(required = false) String administrativeNotes) {
        ReferralResponse referral = referralService.updateReferralStatus(id, status, appointmentId, administrativeNotes);
        return ResponseEntity.ok(ok("Referral status updated successfully", referral));
    }

    // ─── Patient Self-Service ─────────────────────────────────────────────────

    /**
     * Patient: view own referral status only.
     * PatientId resolved from JWT — never from URL/query params.
     * Patient cannot:
     * - modify clinical referral reason
     * - modify clinical decision
     * - modify target hospital/doctor
     * - view administrativeNotes or clinicalNotes (filtered in patient-facing DTO)
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyReferrals(Authentication auth) {
        Long patientId = resolvePatientId(auth);
        // Filter on server — only return patient-visible fields
        List<ReferralResponse> referrals = referralService.getReferrals(null, patientId, null);
        // Strip administrative and clinical internal notes before returning to patient
        referrals.forEach(ref -> {
            ref.setClinicalNotes(null);
            ref.setAdministrativeNotes(null);
        });
        return ResponseEntity.ok(ok("Your referrals retrieved successfully", referrals));
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
