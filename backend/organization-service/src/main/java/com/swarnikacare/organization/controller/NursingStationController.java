package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.NursingStationRequest;
import com.swarnikacare.organization.entity.NursingStation;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.security.ScopeValidator;
import com.swarnikacare.organization.service.NursingStationService;
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
@RequestMapping("/api/v1/nursing-stations")
public class NursingStationController {
    private final NursingStationService nursingStationService;
    private final UnitService unitService;
    private final ScopeValidator scopeValidator;

    public NursingStationController(NursingStationService nursingStationService, UnitService unitService, ScopeValidator scopeValidator) {
        this.nursingStationService = nursingStationService;
        this.unitService = unitService;
        this.scopeValidator = scopeValidator;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNursingStationsByUnit(@RequestParam Long unitId) {
        Unit unit = unitService.findById(unitId);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), unit.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        List<NursingStation> stations = nursingStationService.findAllByUnit(unitId);
        return ok(stations);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getNursingStationById(@PathVariable Long id) {
        NursingStation station = nursingStationService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), station.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        return ok(station);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody NursingStationRequest payload) {
        NursingStation station = nursingStationService.create(payload);
        return ok(station);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody NursingStationRequest payload) {
        NursingStation station = nursingStationService.update(id, payload);
        return ok(station);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        NursingStation station = nursingStationService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), station.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        nursingStationService.delete(id);
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
