package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.ShiftHandoverDto;
import com.swarnikacare.nursing.entity.ShiftHandover;
import com.swarnikacare.nursing.service.ShiftHandoverService;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nursing/handovers")
public class ShiftHandoverController {
    
    @Autowired
    private ShiftHandoverService handoverService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<ShiftHandover> submitHandover(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody ShiftHandoverDto dto) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        ShiftHandover handover = new ShiftHandover();
        handover.setHospitalId(authHospitalId);
        handover.setUnitId(dto.getUnitId());
        handover.setRosterId(dto.getRosterId() != null ? dto.getRosterId() : 0L); // Default or from context
        handover.setFromNurseUserId(authUserId);
        handover.setToNurseUserId(dto.getIncomingNurseUserId());
        handover.setPatientAssignmentId(null); // Optional assignment link
        handover.setAdmissionId(dto.getAdmissionId());
        handover.setSummary(dto.getSummary());
        handover.setPendingTasks(dto.getPendingTasks());
        handover.setImportantObservations(dto.getImportantObservations());
        handover.setPendingInvestigations(dto.getPendingInvestigations());
        handover.setPendingMedicationActions(dto.getPendingMedicationActions());
        handover.setStatus("SUBMITTED");

        return ResponseEntity.ok(handoverService.save(handover));
    }
    
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<ShiftHandover>> getMyHandovers(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return ResponseEntity.ok(handoverService.getHandoversForNurse(authUserId, authHospitalId));
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
