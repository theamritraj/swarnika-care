package com.swarnikacare.doctor.controller;

import com.swarnikacare.doctor.dto.DoctorOnboardingCompleteRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingInitiateRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingResponse;
import com.swarnikacare.doctor.service.DoctorOnboardingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors/onboarding")
public class DoctorOnboardingController {

    private final DoctorOnboardingService doctorOnboardingService;

    public DoctorOnboardingController(DoctorOnboardingService doctorOnboardingService) {
        this.doctorOnboardingService = doctorOnboardingService;
    }

    @PostMapping("/initiate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> initiateOnboarding(@Valid @RequestBody DoctorOnboardingInitiateRequest request) {
        String message = doctorOnboardingService.initiateOnboarding(request);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/complete")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> completeOnboarding(@Valid @RequestBody DoctorOnboardingCompleteRequest request) {
        DoctorOnboardingResponse response = doctorOnboardingService.completeOnboarding(request);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", response.getMessage());
        resp.put("data", response);
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }

    @PostMapping("/resend")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> resendOtp(
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String email) {
        String targetEmail = (body != null && body.containsKey("email")) ? body.get("email") : email;
        if (targetEmail == null || targetEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required for resending OTP.");
        }
        String message = doctorOnboardingService.resendOnboardingOtp(targetEmail.trim());
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        return ResponseEntity.ok(resp);
    }
}
