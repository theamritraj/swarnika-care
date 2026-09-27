package com.swarnikacare.encounter.controller;

import com.swarnikacare.encounter.client.PatientClient;
import com.swarnikacare.encounter.dto.QueueTokenRequest;
import com.swarnikacare.encounter.dto.QueueTokenResponse;
import com.swarnikacare.encounter.entity.TokenStatus;
import com.swarnikacare.encounter.service.QueueTokenService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/queue-tokens")
public class QueueTokenController {

    private final QueueTokenService queueTokenService;
    private final PatientClient patientClient;

    public QueueTokenController(QueueTokenService queueTokenService, PatientClient patientClient) {
        this.queueTokenService = queueTokenService;
        this.patientClient = patientClient;
    }

    // ─── Staff / Reception Endpoints ──────────────────────────────────────────

    @PostMapping({"", "/issue"})
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE','PATIENT')")
    public ResponseEntity<Map<String, Object>> issueToken(@Valid @RequestBody QueueTokenRequest request) {
        QueueTokenResponse token = queueTokenService.issueToken(request);
        return new ResponseEntity<>(ok("Queue token issued successfully", token), HttpStatus.CREATED);
    }

    /**
     * Staff-only: query all tokens by hospital/doctor/date/status.
     * PATIENT must use GET /me to see own tokens.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Map<String, Object>> getTokens(
            @RequestParam Long hospitalId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate queueDate,
            @RequestParam(required = false) TokenStatus status) {
        List<QueueTokenResponse> tokens = queueTokenService.getTokens(hospitalId, doctorId, queueDate, status);
        return ResponseEntity.ok(ok("Queue tokens retrieved successfully", tokens));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Map<String, Object>> getTokenById(@PathVariable Long id) {
        QueueTokenResponse token = queueTokenService.getTokenById(id);
        return ResponseEntity.ok(ok("Queue token retrieved successfully", token));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam TokenStatus status) {
        QueueTokenResponse token = queueTokenService.updateTokenStatus(id, status);
        return ResponseEntity.ok(ok("Queue token status updated successfully", token));
    }

    // ─── Patient Self-Service ─────────────────────────────────────────────────

    /**
     * Patient: get today's own queue tokens.
     * PatientId resolved from JWT — never from URL/query params.
     * Patient cannot see other patients' names, tokens, or wait positions.
     * Response contains ONLY the patient's own token(s) — never the full queue.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyTokens(
            Authentication auth,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate queueDate) {
        Long patientId = resolvePatientId(auth);
        LocalDate date = queueDate != null ? queueDate : LocalDate.now();

        // Fetch all tokens for given hospital+date, then filter to patient's own
        List<QueueTokenResponse> allTokens;
        if (hospitalId != null) {
            allTokens = queueTokenService.getTokens(hospitalId, null, date, null);
        } else {
            // Without hospitalId, return empty — patient must specify hospital
            return ResponseEntity.ok(ok("Your queue tokens retrieved successfully", List.of()));
        }

        // Server-side ownership filter — never trust patientId from client
        List<QueueTokenResponse> myTokens = allTokens.stream()
                .filter(t -> patientId.equals(t.getPatientId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ok("Your queue tokens retrieved successfully", myTokens));
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
