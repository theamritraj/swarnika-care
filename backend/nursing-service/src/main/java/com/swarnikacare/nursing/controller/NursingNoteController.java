package com.swarnikacare.nursing.controller;

import com.swarnikacare.nursing.entity.NursingNote;
import com.swarnikacare.nursing.service.NursingNoteService;
import com.swarnikacare.nursing.service.PatientAssignmentService;
import com.swarnikacare.nursing.dto.NursingNoteDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nursing/patients/{patientId}/notes")
public class NursingNoteController {
    @Autowired
    private NursingNoteService noteService;

    @Autowired
    private PatientAssignmentService assignmentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('NURSE', 'DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<NursingNote>> getNotes(
            @PathVariable Long patientId,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);
        if (authUserId == null || authHospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_HOSPITAL_ADMIN") || a.getAuthority().equals("ROLE_DOCTOR"));
        if (!isStaff) {
            if (!assignmentService.isPatientAssignedToNurse(patientId, authUserId, authHospitalId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        return ResponseEntity.ok(noteService.findByPatientId(patientId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<NursingNote> createNote(
            @PathVariable Long patientId,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody NursingNoteDto dto) {
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);
        if (authUserId == null || authHospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_HOSPITAL_ADMIN"));
        if (!isStaff) {
            if (!assignmentService.isPatientAssignedToNurse(patientId, authUserId, authHospitalId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        NursingNote note = new NursingNote();
        note.setPatientId(patientId);
        note.setAdmissionId(dto.getAdmissionId());
        note.setHospitalId(authHospitalId);
        note.setNurseUserId(authUserId);
        note.setNoteType(dto.getNoteType());
        note.setContent(dto.getContent());
        
        return ResponseEntity.ok(noteService.save(note));
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
