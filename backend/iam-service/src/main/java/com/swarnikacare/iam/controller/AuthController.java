package com.swarnikacare.iam.controller;

import com.swarnikacare.iam.dto.AuthResponse;
import com.swarnikacare.iam.dto.OtpRequest;
import com.swarnikacare.iam.dto.OtpVerifyRequest;
import com.swarnikacare.iam.dto.PatientRegistrationRequest;
import com.swarnikacare.iam.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/patient")
    public ResponseEntity<Map<String, Object>> registerPatient(@Valid @RequestBody PatientRegistrationRequest request) {
        authService.registerPatient(request);
        return ResponseEntity.ok(createSuccessResponse("If email is valid, an OTP has been sent for registration"));
    }

    @PostMapping("/request-otp")
    public ResponseEntity<Map<String, Object>> requestOtp(@Valid @RequestBody OtpRequest request) {
        authService.requestOtp(request);
        return ResponseEntity.ok(createSuccessResponse("If account exists, an OTP has been sent"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        Map<String, Object> data = new HashMap<>();
        data.put("token", response.getToken());
        data.put("type", response.getType());
        return ResponseEntity.ok(createSuccessResponse("Authentication successful", data));
    }

    private Map<String, Object> createSuccessResponse(String message) {
        return createSuccessResponse(message, null);
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
