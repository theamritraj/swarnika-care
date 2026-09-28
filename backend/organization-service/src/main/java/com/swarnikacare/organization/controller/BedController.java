package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.BedRequest;
import com.swarnikacare.organization.entity.Bed;
import com.swarnikacare.organization.entity.Room;
import com.swarnikacare.organization.security.ScopeValidator;
import com.swarnikacare.organization.service.BedService;
import com.swarnikacare.organization.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/beds")
public class BedController {
    private final BedService bedService;
    private final RoomService roomService;
    private final ScopeValidator scopeValidator;

    public BedController(BedService bedService, RoomService roomService, ScopeValidator scopeValidator) {
        this.bedService = bedService;
        this.roomService = roomService;
        this.scopeValidator = scopeValidator;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getBedsByRoom(@RequestParam Long roomId) {
        Room room = roomService.findById(roomId);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), room.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        List<Bed> beds = bedService.findAllByRoom(roomId);
        return ok(beds);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBedById(@PathVariable Long id) {
        Bed bed = bedService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), bed.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        return ok(bed);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody BedRequest payload) {
        Bed bed = bedService.create(payload);
        return ok(bed);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody BedRequest payload) {
        Bed bed = bedService.update(id, payload);
        return ok(bed);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE')")
    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> status) {
        Bed bed = bedService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), bed.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        Bed updated = bedService.updateStatus(id, status);
        return ok(updated);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Bed bed = bedService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), bed.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        bedService.delete(id);
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
