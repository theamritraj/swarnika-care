package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Public-safe hospital endpoint for the public website.
 * Returns only fields safe for anonymous access.
 * Does NOT expose internal fields like bed counts, workforce, etc.
 */
@RestController
@RequestMapping("/api/v1/public/hospitals")
public class PublicHospitalController {

    private final HospitalService hospitalService;

    public PublicHospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPublicHospitals() {
        List<Hospital> hospitals = hospitalService.getAllHospitals();

        List<Map<String, Object>> publicHospitals = hospitals.stream()
                .filter(h -> "ACTIVE".equalsIgnoreCase(h.getStatus()))
                .map(this::toPublicView)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Public hospitals retrieved successfully");
        response.put("data", publicHospitals);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toPublicView(Hospital h) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", h.getId());
        view.put("code", h.getCode());
        view.put("name", h.getName());
        view.put("city", h.getCity());
        view.put("state", h.getState());
        view.put("address", h.getAddress());
        view.put("phone", h.getPhone());
        view.put("emergencyPhone", h.getEmergencyPhone());
        view.put("latitude", h.getLatitude());
        view.put("longitude", h.getLongitude());
        return view;
    }
}
