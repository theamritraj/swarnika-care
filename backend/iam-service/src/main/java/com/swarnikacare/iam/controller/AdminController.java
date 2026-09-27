package com.swarnikacare.iam.controller;

import com.swarnikacare.iam.dto.DoctorProvisionRequest;
import com.swarnikacare.iam.dto.UserResponse;
import com.swarnikacare.iam.entity.User;
import com.swarnikacare.iam.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/doctors")
    @PreAuthorize("hasAuthority('ROLE_SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> provisionDoctor(@Valid @RequestBody DoctorProvisionRequest request) {
        User user = userService.createDoctor(request.getEmail());
        UserResponse userResponse = userService.mapToResponse(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Doctor user provisioned successfully");
        response.put("data", userResponse);
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
