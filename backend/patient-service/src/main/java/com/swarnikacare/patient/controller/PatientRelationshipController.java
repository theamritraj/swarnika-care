package com.swarnikacare.patient.controller;

import com.swarnikacare.patient.dto.PatientRelationshipRequest;
import com.swarnikacare.patient.dto.PatientRelationshipResponse;
import com.swarnikacare.patient.service.PatientRelationshipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/relationships")
public class PatientRelationshipController {

    private final PatientRelationshipService relationshipService;

    public PatientRelationshipController(PatientRelationshipService relationshipService) {
        this.relationshipService = relationshipService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addRelationship(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientRelationshipRequest request) {
        PatientRelationshipResponse relationship = relationshipService.addRelationship(patientId, request);
        return new ResponseEntity<>(createSuccessResponse("Relationship created successfully", relationship), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getRelationships(@PathVariable Long patientId) {
        List<PatientRelationshipResponse> relationships = relationshipService.getRelationshipsForPatient(patientId);
        return ResponseEntity.ok(createSuccessResponse("Relationships retrieved successfully", relationships));
    }

    @DeleteMapping("/{relationshipId}")
    public ResponseEntity<Map<String, Object>> deleteRelationship(
            @PathVariable Long patientId,
            @PathVariable Long relationshipId) {
        relationshipService.deleteRelationship(patientId, relationshipId);
        return ResponseEntity.ok(createSuccessResponse("Relationship deleted successfully", null));
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
