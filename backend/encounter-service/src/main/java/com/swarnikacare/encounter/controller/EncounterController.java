package com.swarnikacare.encounter.controller;

import com.swarnikacare.encounter.client.PatientClient;
import com.swarnikacare.encounter.dto.*;
import com.swarnikacare.encounter.service.EncounterService;
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
@RequestMapping("/api/v1/encounters")
public class EncounterController {

    private final EncounterService encounterService;
    private final PatientClient patientClient;

    public EncounterController(EncounterService encounterService, PatientClient patientClient) {
        this.encounterService = encounterService;
        this.patientClient = patientClient;
    }

    // ─── Staff / Clinical Endpoints ──────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> createEncounter(@Valid @RequestBody EncounterCreateRequest request) {
        EncounterResponse response = encounterService.createEncounter(request);
        return new ResponseEntity<>(ok("Encounter created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getAllEncounters() {
        List<EncounterResponse> list = encounterService.getAllEncounters();
        return ResponseEntity.ok(ok("Encounters retrieved successfully", list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getEncounterById(@PathVariable Long id) {
        EncounterResponse response = encounterService.getEncounterById(id);
        return ResponseEntity.ok(ok("Encounter retrieved successfully", response));
    }

    /**
     * Staff-only: get encounters by patientId path param.
     * Patients must use /me/encounters — never this endpoint.
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getEncountersByPatient(@PathVariable Long patientId) {
        List<EncounterResponse> list = encounterService.getEncountersByPatientId(patientId);
        return ResponseEntity.ok(ok("Patient encounters retrieved successfully", list));
    }

    @GetMapping("/hospital/{hospitalId}")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getEncountersByHospital(@PathVariable Long hospitalId) {
        List<EncounterResponse> list = encounterService.getEncountersByHospitalId(hospitalId);
        return ResponseEntity.ok(ok("Hospital encounters retrieved successfully", list));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getEncountersByDoctor(@PathVariable Long doctorId) {
        List<EncounterResponse> list = encounterService.getEncountersByDoctorId(doctorId);
        return ResponseEntity.ok(ok("Doctor encounters retrieved successfully", list));
    }

    @PutMapping("/{id}/consultation")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateConsultation(
            @PathVariable Long id,
            @Valid @RequestBody ConsultationUpdateRequest request) {
        EncounterResponse response = encounterService.updateConsultation(id, request);
        return ResponseEntity.ok(ok("Consultation updated successfully", response));
    }

    @PostMapping("/{id}/prescriptions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createPrescription(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionCreateRequest request,
            @RequestParam(required = false) Long doctorId) {
        PrescriptionResponse response = encounterService.createPrescription(id, request, doctorId);
        return new ResponseEntity<>(ok("Prescription created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/prescriptions")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getPrescriptionsByEncounter(@PathVariable Long id) {
        List<PrescriptionResponse> list = encounterService.getPrescriptionsByEncounterId(id);
        return ResponseEntity.ok(ok("Prescriptions retrieved successfully", list));
    }

    /**
     * Staff-only: prescriptions by patient path param.
     * Patients must use /me/prescriptions.
     */
    @GetMapping("/prescriptions/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        List<PrescriptionResponse> list = encounterService.getPrescriptionsByPatientId(patientId);
        return ResponseEntity.ok(ok("Patient prescriptions retrieved successfully", list));
    }

    @PostMapping("/{id}/orders")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createClinicalOrder(
            @PathVariable Long id,
            @Valid @RequestBody ClinicalOrderCreateRequest request,
            @RequestParam(required = false) Long doctorId) {
        ClinicalOrderResponse response = encounterService.createClinicalOrder(id, request, doctorId);
        return new ResponseEntity<>(ok("Clinical order created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/orders")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getClinicalOrdersByEncounter(@PathVariable Long id) {
        List<ClinicalOrderResponse> list = encounterService.getClinicalOrdersByEncounterId(id);
        return ResponseEntity.ok(ok("Clinical orders retrieved successfully", list));
    }

    /**
     * Staff-only: orders by patient path param.
     * Patients must use /me/orders.
     */
    @GetMapping("/orders/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST','NURSE')")
    public ResponseEntity<Map<String, Object>> getClinicalOrdersByPatient(@PathVariable Long patientId) {
        List<ClinicalOrderResponse> list = encounterService.getClinicalOrdersByPatientId(patientId);
        return ResponseEntity.ok(ok("Patient clinical orders retrieved successfully", list));
    }

    @PatchMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> startEncounter(@PathVariable Long id) {
        EncounterResponse response = encounterService.startEncounter(id);
        return ResponseEntity.ok(ok("Encounter started successfully", response));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DOCTOR', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> completeEncounter(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        EncounterResponse response = encounterService.completeEncounter(id, notes);
        return ResponseEntity.ok(ok("Encounter completed successfully", response));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DOCTOR','SUPER_ADMIN','HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> cancelEncounter(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        EncounterResponse response = encounterService.cancelEncounter(id, reason);
        return ResponseEntity.ok(ok("Encounter cancelled successfully", response));
    }

    // ─── Patient Self-Service Endpoints ──────────────────────────────────────
    // Identity is ALWAYS derived from JWT — never from request parameters.

    /**
     * Patient: get own encounter history.
     * Resolves patientId from JWT userId via patient-service /me endpoint.
     */
    @GetMapping("/me/encounters")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyEncounters(Authentication auth) {
        Long patientId = resolvePatientIdFromAuth(auth);
        List<EncounterResponse> list = encounterService.getEncountersByPatientId(patientId);
        return ResponseEntity.ok(ok("Your encounters retrieved successfully", list));
    }

    /**
     * Patient: get own prescriptions.
     */
    @GetMapping("/me/prescriptions")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyPrescriptions(Authentication auth) {
        Long patientId = resolvePatientIdFromAuth(auth);
        List<PrescriptionResponse> list = encounterService.getPrescriptionsByPatientId(patientId);
        return ResponseEntity.ok(ok("Your prescriptions retrieved successfully", list));
    }

    /**
     * Patient: get own lab and imaging orders.
     */
    @GetMapping("/me/orders")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyOrders(Authentication auth) {
        Long patientId = resolvePatientIdFromAuth(auth);
        List<ClinicalOrderResponse> list = encounterService.getClinicalOrdersByPatientId(patientId);
        return ResponseEntity.ok(ok("Your lab orders retrieved successfully", list));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Resolves patient entity ID from the authenticated IAM userId.
     * Never trusts patientId from URL or request body.
     */
    @SuppressWarnings("unchecked")
    private Long resolvePatientIdFromAuth(Authentication auth) {
        if (auth == null) throw new AccessDeniedException("Unauthorized");
        String userId = auth.getName();
        try {
            // Call patient-service /me endpoint which resolves by userId from JWT
            Map<String, Object> resp = patientClient.getPatientMe(userId);
            Object data = resp.get("data");
            if (data instanceof Map) {
                Object idObj = ((Map<String, Object>) data).get("id");
                if (idObj instanceof Number) return ((Number) idObj).longValue();
            }
        } catch (Exception e) {
            throw new AccessDeniedException("Could not resolve patient identity: " + e.getMessage());
        }
        throw new AccessDeniedException("Patient identity could not be resolved");
    }

    private Map<String, Object> ok(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null) response.put("data", data);
        return response;
    }
}
