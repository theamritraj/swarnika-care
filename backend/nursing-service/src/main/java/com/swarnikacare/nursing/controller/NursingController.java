package com.swarnikacare.nursing.controller;

import com.swarnikacare.nursing.entity.*;
import com.swarnikacare.nursing.service.*;
import com.swarnikacare.nursing.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nursing")
public class NursingController {

    @Autowired
    private PatientAssignmentService assignmentService;

    @Autowired
    private VitalsService vitalsService;

    @GetMapping("/patients/my-patients")
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<PatientAssignment>> getMyPatients(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return ResponseEntity.ok(assignmentService.findMyPatients(authUserId, authHospitalId));
    }

    @PostMapping("/patients/assignments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'NURSE')")
    public ResponseEntity<PatientAssignment> createAssignment(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody PatientAssignmentDto dto) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        PatientAssignment assignment = new PatientAssignment();
        assignment.setAdmissionId(dto.getAdmissionId());
        assignment.setPatientId(dto.getPatientId());
        assignment.setHospitalId(authHospitalId);
        assignment.setUnitId(dto.getUnitId());
        assignment.setRoomId(dto.getRoomId());
        assignment.setBedId(dto.getBedId());
        assignment.setRosterId(dto.getRosterId());
        assignment.setNurseUserId(authUserId);
        assignment.setCreatedBy(authUserId);
        
        return ResponseEntity.ok(assignmentService.save(assignment));
    }

    @PostMapping("/patients/{patientId}/vitals")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Vitals> recordVitals(
            @PathVariable Long patientId,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody VitalsDto dto) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Validation: Verify if patient is assigned to this nurse (or authorized staff)
        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || a.getAuthority().equals("ROLE_DOCTOR"));
        if (!isStaff) {
            boolean isAssigned = assignmentService.isPatientAssignedToNurse(patientId, authUserId, authHospitalId);
            if (!isAssigned) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        Vitals vitals = new Vitals();
        vitals.setPatientId(patientId);
        vitals.setAdmissionId(dto.getAdmissionId());
        vitals.setHospitalId(authHospitalId);
        vitals.setUnitId(dto.getUnitId());
        vitals.setTemperature(dto.getTemperature());
        vitals.setPulse(dto.getPulse());
        vitals.setRespiratoryRate(dto.getRespiratoryRate());
        vitals.setSystolicBp(dto.getSystolicBp());
        vitals.setDiastolicBp(dto.getDiastolicBp());
        vitals.setOxygenSaturation(dto.getOxygenSaturation());
        vitals.setBloodGlucose(dto.getBloodGlucose());
        vitals.setWeight(dto.getWeight());
        vitals.setHeight(dto.getHeight());
        vitals.setPainScore(dto.getPainScore());
        vitals.setConsciousnessState(dto.getConsciousnessState());
        vitals.setNotes(dto.getNotes());
        vitals.setRecordedBy(authUserId);
        
        return ResponseEntity.ok(vitalsService.save(vitals));
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
