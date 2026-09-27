package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.FloorRequest;
import com.swarnikacare.organization.entity.Building;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.security.ScopeValidator;
import com.swarnikacare.organization.service.BuildingService;
import com.swarnikacare.organization.service.FloorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/floors")
public class FloorController {
    private final FloorService floorService;
    private final BuildingService buildingService;
    private final ScopeValidator scopeValidator;

    public FloorController(FloorService floorService, BuildingService buildingService, ScopeValidator scopeValidator) {
        this.floorService = floorService;
        this.buildingService = buildingService;
        this.scopeValidator = scopeValidator;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFloorsByBuilding(@RequestParam Long buildingId) {
        Building building = buildingService.findById(buildingId);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), building.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        List<Floor> floors = floorService.findAllByBuilding(buildingId);
        return ok(floors);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFloorById(@PathVariable Long id) {
        Floor floor = floorService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), floor.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        return ok(floor);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody FloorRequest payload) {
        Floor floor = floorService.create(payload);
        return ok(floor);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody FloorRequest payload) {
        Floor floor = floorService.update(id, payload);
        return ok(floor);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Floor floor = floorService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), floor.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        floorService.delete(id);
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
