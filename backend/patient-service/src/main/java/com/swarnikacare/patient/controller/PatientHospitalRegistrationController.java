package com.swarnikacare.patient.controller;

import com.swarnikacare.patient.dto.PatientHospitalRegistrationRequest;
import com.swarnikacare.patient.dto.PatientHospitalRegistrationResponse;
import com.swarnikacare.patient.service.PatientHospitalRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/registrations")
public class PatientHospitalRegistrationController {

    private final PatientHospitalRegistrationService registrationService;

    public PatientHospitalRegistrationController(PatientHospitalRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> registerAtHospital(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientHospitalRegistrationRequest request) {
        PatientHospitalRegistrationResponse registration = registrationService.registerPatientAtHospital(patientId, request);
        return new ResponseEntity<>(createSuccessResponse("Patient registered at hospital successfully", registration), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getRegistrations(@PathVariable Long patientId) {
        List<PatientHospitalRegistrationResponse> registrations = registrationService.getHospitalRegistrationsForPatient(patientId);
        return ResponseEntity.ok(createSuccessResponse("Hospital registrations retrieved successfully", registrations));
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
