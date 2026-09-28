package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.HospitalCreateRequest;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createHospital(@Valid @RequestBody HospitalCreateRequest request) {
        Hospital hospital = hospitalService.createHospital(request);
        return new ResponseEntity<>(createSuccessResponse("Hospital created successfully", hospital), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> getAllHospitals() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();
        return ResponseEntity.ok(createSuccessResponse("Hospitals retrieved successfully", hospitals));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> getHospitalById(@PathVariable Long id) {
        Hospital hospital = hospitalService.getHospitalById(id);
        return ResponseEntity.ok(createSuccessResponse("Hospital retrieved successfully", hospital));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateHospital(@PathVariable Long id, @RequestBody HospitalCreateRequest request) {
        Hospital hospital = hospitalService.updateHospital(id, request);
        return ResponseEntity.ok(createSuccessResponse("Hospital updated successfully", hospital));
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
