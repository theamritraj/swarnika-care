package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.BuildingRequest;
import com.swarnikacare.organization.entity.Building;
import com.swarnikacare.organization.security.ScopeValidator;
import com.swarnikacare.organization.service.BuildingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/buildings")
public class BuildingController {
    private final BuildingService buildingService;
    private final ScopeValidator scopeValidator;

    public BuildingController(BuildingService buildingService, ScopeValidator scopeValidator) {
        this.buildingService = buildingService;
        this.scopeValidator = scopeValidator;
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getBuildingsByHospital(@RequestParam Long hospitalId) {
        List<Building> buildings = buildingService.findAllByHospital(hospitalId);
        return ok(buildings);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBuildingById(@PathVariable Long id) {
        Building building = buildingService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), building.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        return ok(building);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody BuildingRequest payload) {
        Building building = buildingService.create(payload);
        return ok(building);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody BuildingRequest payload) {
        Building building = buildingService.update(id, payload);
        return ok(building);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Building building = buildingService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), building.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        buildingService.delete(id);
        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        return ResponseEntity.ok(map);
    }

    private ResponseEntity<Map<String, Object>> ok(Object data) {
        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("data", data);
        return ResponseEntity.ok(map);
    }
}
