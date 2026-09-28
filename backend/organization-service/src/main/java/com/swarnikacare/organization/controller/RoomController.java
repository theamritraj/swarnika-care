package com.swarnikacare.organization.controller;

import com.swarnikacare.organization.dto.RoomRequest;
import com.swarnikacare.organization.entity.Room;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.security.ScopeValidator;
import com.swarnikacare.organization.service.RoomService;
import com.swarnikacare.organization.service.UnitService;
import com.swarnikacare.organization.service.FloorService;
import com.swarnikacare.organization.entity.Floor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {
    private final RoomService roomService;
    private final UnitService unitService;
    private final FloorService floorService;
    private final ScopeValidator scopeValidator;

    public RoomController(RoomService roomService, UnitService unitService, FloorService floorService, ScopeValidator scopeValidator) {
        this.roomService = roomService;
        this.unitService = unitService;
        this.floorService = floorService;
        this.scopeValidator = scopeValidator;
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getRooms(@RequestParam(required = false) Long unitId, @RequestParam(required = false) Long floorId) {
        if (unitId != null) {
            Unit unit = unitService.findById(unitId);
            if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), unit.getHospitalId())) {
                throw new AccessDeniedException("Access denied to this hospital resource");
            }
            return ok(roomService.findAllByUnit(unitId));
        } else if (floorId != null) {
            Floor floor = floorService.findById(floorId);
            if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), floor.getHospitalId())) {
                throw new AccessDeniedException("Access denied to this hospital resource");
            }
            return ok(roomService.findAllByFloor(floorId));
        }
        throw new IllegalArgumentException("Either unitId or floorId must be provided");
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRoomById(@PathVariable Long id) {
        Room room = roomService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), room.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        return ok(room);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody RoomRequest payload) {
        Room room = roomService.create(payload);
        return ok(room);
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #payload.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody RoomRequest payload) {
        Room room = roomService.update(id, payload);
        return ok(room);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'DOCTOR', 'NURSE')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> status) {
        Room room = roomService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), room.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        Room updated = roomService.updateStatus(id, status);
        return ok(updated);
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'OPERATIONS_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Room room = roomService.findById(id);
        if (!scopeValidator.canAccessHospital(SecurityContextHolder.getContext().getAuthentication(), room.getHospitalId())) {
            throw new AccessDeniedException("Access denied to this hospital resource");
        }
        roomService.delete(id);
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
