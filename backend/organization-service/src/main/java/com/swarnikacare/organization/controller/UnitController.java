package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.UnitRequest;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.security.ScopeValidator;
import com.swarnikacare.organization.service.FloorService;
import com.swarnikacare.organization.service.UnitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/units")
public class UnitController {
    private final UnitService unitService;
    private final FloorService floorService;
    private final ScopeValidator scopeValidator;

    public UnitController(UnitService unitService, FloorService floorService, ScopeValidator scopeValidator) {
        this.unitService = unitService;
        this.floorService = floorService;
        this.scopeValidator = scopeValidator;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUnitsByFloor(@RequestParam Long floorId) {
        Floor floor = floorService.findById(floorId);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), floor.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        List<Unit> units = unitService.findAllByFloor(floorId);
        return ok(units);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUnitById(@PathVariable Long id) {
        Unit unit = unitService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), unit.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        return ok(unit);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody UnitRequest payload) {
        Unit unit = unitService.create(payload);
        return ok(unit);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody UnitRequest payload) {
        Unit unit = unitService.update(id, payload);
        return ok(unit);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Unit unit = unitService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), unit.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        unitService.delete(id);
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
