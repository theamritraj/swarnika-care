package com.swarnikacare.nursing.controller;

import com.swarnikacare.nursing.entity.NursingNote;
import com.swarnikacare.nursing.service.NursingNoteService;
import com.swarnikacare.nursing.service.PatientAssignmentService;
import com.swarnikacare.nursing.dto.NursingNoteDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nursing/patients/{patientId}/notes")
public class NursingNoteController {
    @Autowired
    private NursingNoteService noteService;

    @Autowired
    private PatientAssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<NursingNote>> getNotes(
            @PathVariable Long patientId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        if (userId == null || hospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        if (!assignmentService.isPatientAssignedToNurse(patientId, userId, hospitalId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(noteService.findByPatientId(patientId));
    }

    @PostMapping
    public ResponseEntity<NursingNote> createNote(
            @PathVariable Long patientId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody NursingNoteDto dto) {
        if (userId == null || hospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        if (!assignmentService.isPatientAssignedToNurse(patientId, userId, hospitalId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        NursingNote note = new NursingNote();
        note.setPatientId(patientId);
        note.setAdmissionId(dto.getAdmissionId());
        note.setHospitalId(hospitalId);
        note.setNurseUserId(userId);
        note.setNoteType(dto.getNoteType());
        note.setContent(dto.getContent());
        
        return ResponseEntity.ok(noteService.save(note));
    }
}
