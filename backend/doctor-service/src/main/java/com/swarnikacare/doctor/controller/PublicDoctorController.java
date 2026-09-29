package com.swarnikacare.doctor.controller;

import com.swarnikacare.doctor.dto.DoctorProfileResponse;
import com.swarnikacare.doctor.service.DoctorProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Public doctor directory endpoints for the patient portal and public website.
 * Explicitly public - no authentication required.
 */
@RestController
@RequestMapping("/api/v1/public/doctors")
public class PublicDoctorController {

    private final DoctorProfileService profileService;

    public PublicDoctorController(DoctorProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getPublishedDoctors(
            @org.springframework.web.bind.annotation.RequestParam(value = "hospitalId", required = false) Long hospitalId,
            @org.springframework.web.bind.annotation.RequestParam(value = "specialization", required = false) String specialization) {
        List<DoctorProfileResponse> publishedProfiles = profileService.getPublishedProfiles(hospitalId, specialization);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Published doctors retrieved successfully");
        response.put("data", publishedProfiles);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/specialities")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getAvailableSpecialities(
            @org.springframework.web.bind.annotation.RequestParam(value = "hospitalId", required = false) Long hospitalId) {
        List<Map<String, Object>> specialities = profileService.getAvailableSpecialities(hospitalId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Available specialities retrieved successfully");
        response.put("data", specialities);
        
        return ResponseEntity.ok(response);
    }
}
