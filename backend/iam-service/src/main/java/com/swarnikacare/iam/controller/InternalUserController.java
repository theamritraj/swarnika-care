package com.swarnikacare.iam.controller;

import com.swarnikacare.iam.dto.DoctorProvisionRequest;
import com.swarnikacare.iam.dto.UserResponse;
import com.swarnikacare.iam.entity.User;
import com.swarnikacare.iam.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.HashMap;
import java.util.Map;

/**
 * Internal service-to-service controller.
 * Authentication & authorization are enforced by InternalApiFilter via X-Internal-Secret header.
 * Not exposed through API Gateway.
 */
@RestController
@RequestMapping("/api/v1/internal/users")
@PreAuthorize("permitAll()")
public class InternalUserController {

    private final UserService userService;
    private final com.swarnikacare.iam.service.OtpService otpService;

    public InternalUserController(UserService userService, com.swarnikacare.iam.service.OtpService otpService) {
        this.userService = userService;
        this.otpService = otpService;
    }

    @PostMapping("/send-verification-otp")
    public ResponseEntity<Map<String, Object>> sendVerificationOtp(@Valid @RequestBody com.swarnikacare.iam.dto.SendVerificationOtpRequest request) {
        // If an ACTIVE user already exists with this email, reject
        userService.findByEmail(request.getEmail()).ifPresent(u -> {
            if (u.getStatus() == com.swarnikacare.iam.entity.UserStatus.ACTIVE) {
                throw new IllegalArgumentException("User with this email already exists");
            }
        });

        com.swarnikacare.iam.entity.OtpPurpose purpose = com.swarnikacare.iam.entity.OtpPurpose.DOCTOR_ONBOARDING;
        if (request.getPurpose() != null) {
            try {
                purpose = com.swarnikacare.iam.entity.OtpPurpose.valueOf(request.getPurpose());
            } catch (Exception ignored) {}
        }

        otpService.generateAndSendOtp(request.getEmail(), purpose);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Verification code sent to " + request.getEmail());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@Valid @RequestBody com.swarnikacare.iam.dto.VerifyOtpInternalRequest request) {
        com.swarnikacare.iam.entity.OtpPurpose purpose = com.swarnikacare.iam.entity.OtpPurpose.DOCTOR_ONBOARDING;
        if (request.getPurpose() != null) {
            try {
                purpose = com.swarnikacare.iam.entity.OtpPurpose.valueOf(request.getPurpose());
            } catch (Exception ignored) {}
        }

        boolean valid = otpService.verifyOtp(request.getEmail(), request.getOtp(), purpose);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("valid", valid);
        resp.put("message", valid ? "Email verified successfully" : "Invalid verification code");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/provision-doctor")
    public ResponseEntity<UserResponse> provisionDoctor(@Valid @RequestBody DoctorProvisionRequest request) {
        User user = userService.createDoctor(request.getEmail());
        UserResponse userResponse = userService.mapToResponse(user);
        return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
    }

    @PostMapping("/provision-staff")
    public ResponseEntity<UserResponse> provisionStaff(@Valid @RequestBody com.swarnikacare.iam.dto.StaffProvisionRequest request) {
        User user = userService.createStaffUser(request.getEmail(), request.getRole());
        UserResponse userResponse = userService.mapToResponse(user);
        return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("id") Long id) {
        return userService.findById(id)
                .map(userService::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam("email") String email) {
        return userService.findByEmail(email)
                .map(userService::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        // Implementation for compensating transaction (rollback IAM creation)
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
