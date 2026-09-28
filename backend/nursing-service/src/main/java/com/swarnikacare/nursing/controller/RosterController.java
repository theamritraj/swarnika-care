package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.RosterDto;
import com.swarnikacare.nursing.entity.Roster;
import com.swarnikacare.nursing.service.RosterService;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nursing/rosters")
public class RosterController {
    
    @Autowired
    private RosterService rosterService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<Roster>> getRosters(
            Authentication authentication,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
            
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return ResponseEntity.ok(rosterService.findByHospitalId(authHospitalId));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Roster> createRoster(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody RosterDto dto) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Roster roster = new Roster();
        roster.setHospitalId(authHospitalId);
        roster.setUnitId(dto.getUnitId());
        roster.setRosterDate(dto.getRosterDate());
        roster.setShiftTemplateId(dto.getShiftTemplateId());
        roster.setCreatedBy(authUserId);
        
        return ResponseEntity.ok(rosterService.save(roster));
    }

    private Long resolveHospitalId(Authentication authentication, Long headerHospitalId) {
        if (headerHospitalId != null) return headerHospitalId;
        if (authentication != null && authentication.getDetails() instanceof Map) {
            Object hid = ((Map<?, ?>) authentication.getDetails()).get("hospitalId");
            if (hid != null) {
                try {
                    return Long.valueOf(hid.toString());
                } catch (Exception ignored) {}
            }
        }
        return null;
    }
}
