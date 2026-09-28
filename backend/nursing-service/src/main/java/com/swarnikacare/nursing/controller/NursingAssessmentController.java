package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.NursingAssessmentDto;
import com.swarnikacare.nursing.entity.NursingAssessment;
import com.swarnikacare.nursing.service.NursingAssessmentService;
import com.swarnikacare.nursing.service.PatientAssignmentService;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nursing/assessments")
public class NursingAssessmentController {
    
    @Autowired
    private NursingAssessmentService assessmentService;
    
    @Autowired
    private PatientAssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<NursingAssessment> submitAssessment(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody NursingAssessmentDto dto) {
            
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
        
        NursingAssessment assessment = new NursingAssessment();
        assessment.setPatientId(dto.getPatientId());
        assessment.setAdmissionId(dto.getAdmissionId());
        assessment.setHospitalId(authHospitalId);
        assessment.setGeneralCondition(dto.getGeneralCondition());
        assessment.setConsciousness(dto.getConsciousness());
        assessment.setPainAssessment(dto.getPainAssessment());
        assessment.setMobility(dto.getMobility());
        assessment.setFallRisk(dto.getFallRisk());
        assessment.setNutrition(dto.getNutrition());
        assessment.setSkinAssessment(dto.getSkinAssessment());
        assessment.setElimination(dto.getElimination());
        assessment.setAllergyAwarenessFlag(dto.getAllergyAwarenessFlag());
        assessment.setNursingObservations(dto.getNursingObservations());
        assessment.setAssessmentStatus(dto.getAssessmentStatus() != null ? dto.getAssessmentStatus() : "DRAFT");
        assessment.setCreatedBy(authUserId);

        return ResponseEntity.ok(assessmentService.save(assessment));
    }
    
    @GetMapping("/patients/{patientId}")
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<NursingAssessment>> getPatientAssessments(
            @PathVariable Long patientId,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
            
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        if (authUserId == null || authHospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Could add checking for isStaff or isAssigned if needed for viewing
        return ResponseEntity.ok(assessmentService.findByPatientIdAndHospitalId(patientId, authHospitalId));
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
