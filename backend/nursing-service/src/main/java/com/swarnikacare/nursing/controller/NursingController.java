package com.swarnikacare.nursing.controller;

import com.swarnikacare.nursing.entity.*;
import com.swarnikacare.nursing.service.*;
import com.swarnikacare.nursing.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nursing")
public class NursingController {

    @Autowired
    private PatientAssignmentService assignmentService;

    @Autowired
    private VitalsService vitalsService;

    @GetMapping("/patients/my-patients")
    public ResponseEntity<List<PatientAssignment>> getMyPatients(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        
        if (userId == null || hospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        return ResponseEntity.ok(assignmentService.findMyPatients(userId, hospitalId));
    }

    @PostMapping("/patients/assignments")
    public ResponseEntity<PatientAssignment> createAssignment(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody PatientAssignmentDto dto) {
            
        if (userId == null || hospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        PatientAssignment assignment = new PatientAssignment();
        assignment.setAdmissionId(dto.getAdmissionId());
        assignment.setPatientId(dto.getPatientId());
        assignment.setHospitalId(hospitalId);
        assignment.setUnitId(dto.getUnitId());
        assignment.setRoomId(dto.getRoomId());
        assignment.setBedId(dto.getBedId());
        assignment.setRosterId(dto.getRosterId());
        assignment.setNurseUserId(userId);
        assignment.setCreatedBy(userId);
        
        return ResponseEntity.ok(assignmentService.save(assignment));
    }

    @PostMapping("/patients/{patientId}/vitals")
    public ResponseEntity<Vitals> recordVitals(
            @PathVariable Long patientId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody VitalsDto dto) {
            
        if (userId == null || hospitalId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        // Validation: Verify if patient is assigned to this nurse
        boolean isAssigned = assignmentService.isPatientAssignedToNurse(patientId, userId, hospitalId);
        if (!isAssigned) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Vitals vitals = new Vitals();
        vitals.setPatientId(patientId);
        vitals.setAdmissionId(dto.getAdmissionId());
        vitals.setHospitalId(hospitalId);
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
        vitals.setRecordedBy(userId);
        
        return ResponseEntity.ok(vitalsService.save(vitals));
    }
}
