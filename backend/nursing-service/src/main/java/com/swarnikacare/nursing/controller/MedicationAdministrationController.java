package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.MedicationAdministrationDto;
import com.swarnikacare.nursing.entity.MedicationAdministrationRecord;
import com.swarnikacare.nursing.service.MedicationAdministrationService;
import com.swarnikacare.nursing.service.PatientAssignmentService;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/nursing/mar")
public class MedicationAdministrationController {
    
    @Autowired
    private MedicationAdministrationService marService;
    
    @Autowired
    private PatientAssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<MedicationAdministrationRecord> administer(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody MedicationAdministrationDto dto) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || a.getAuthority().equals("ROLE_DOCTOR"));
        
        if (!isStaff) {
            boolean isAssigned = assignmentService.isPatientAssignedToNurse(dto.getPatientId(), authUserId, authHospitalId);
            if (!isAssigned) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        MedicationAdministrationRecord record = new MedicationAdministrationRecord();
        record.setPatientId(dto.getPatientId());
        record.setAdmissionId(dto.getAdmissionId());
        record.setHospitalId(authHospitalId);
        record.setNurseUserId(authUserId);
        record.setMedicationOrderId(dto.getPrescriptionId()); // Mapping prescriptionId to medicationOrderId
        record.setScheduledAt(LocalDateTime.now()); // Using now for scheduled if not provided
        record.setAdministeredAt(dto.getAdministeredAt() != null ? dto.getAdministeredAt() : LocalDateTime.now());
        record.setDoseAdministered(dto.getDoseAdministered());
        record.setRoute(dto.getRoute());
        record.setStatus(dto.getStatus());
        record.setReason(dto.getReason());
        record.setNotes(dto.getNotes());

        return ResponseEntity.ok(marService.save(record));
    }
    
    @GetMapping("/patients/{patientId}")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<MedicationAdministrationRecord>> getPatientMAR(
            @PathVariable Long patientId,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return ResponseEntity.ok(marService.findByPatientIdAndHospitalId(patientId, authHospitalId));
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
