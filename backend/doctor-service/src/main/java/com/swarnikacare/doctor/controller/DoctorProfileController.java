package com.swarnikacare.doctor.controller;

import com.swarnikacare.doctor.dto.DoctorProfileRequest;
import com.swarnikacare.doctor.dto.DoctorProfileResponse;
import com.swarnikacare.doctor.entity.PublicProfileStatus;
import com.swarnikacare.doctor.service.DoctorProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors/{doctorId}/profile")
public class DoctorProfileController {

    private final DoctorProfileService profileService;

    public DoctorProfileController(DoctorProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long doctorId) {
        DoctorProfileResponse profile = profileService.getProfileByDoctorId(doctorId);
        return ResponseEntity.ok(createSuccessResponse("Profile retrieved successfully", profile));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> upsertProfile(
            @PathVariable Long doctorId,
            @RequestBody DoctorProfileRequest request) {
        DoctorProfileResponse profile = profileService.upsertProfile(doctorId, request);
        return ResponseEntity.ok(createSuccessResponse("Profile updated successfully", profile));
    }

    @PatchMapping("/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long doctorId,
            @RequestParam PublicProfileStatus status) {
        DoctorProfileResponse profile = profileService.updateStatus(doctorId, status);
        return ResponseEntity.ok(createSuccessResponse("Profile status updated successfully", profile));
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }
}
