package com.swarnikacare.organization.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.swarnikacare.organization.dto.DesignationRequest;
import com.swarnikacare.organization.service.DesignationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/designations")
public class DesignationController {
    private final DesignationService service;

    public DesignationController(DesignationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        return ResponseEntity.ok(Map.of("success", true, "data", service.getAll()));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody DesignationRequest request) {
        return ResponseEntity.ok(Map.of("success", true, "data", service.create(request)));
    }
}
