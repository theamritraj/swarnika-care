import os

dtos = {
    "RosterDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class RosterDto {
    @NotNull private Long hospitalId;
    @NotNull private Long unitId;
    @NotNull private LocalDate rosterDate;
    @NotNull private Long shiftTemplateId;

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public LocalDate getRosterDate() { return rosterDate; }
    public void setRosterDate(LocalDate rosterDate) { this.rosterDate = rosterDate; }
    public Long getShiftTemplateId() { return shiftTemplateId; }
    public void setShiftTemplateId(Long shiftTemplateId) { this.shiftTemplateId = shiftTemplateId; }
}
""",
    "NurseDutyAssignmentDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;

public class NurseDutyAssignmentDto {
    @NotNull private Long rosterId;
    @NotNull private String nurseUserId;
    private String role;

    public Long getRosterId() { return rosterId; }
    public void setRosterId(Long rosterId) { this.rosterId = rosterId; }
    public String getNurseUserId() { return nurseUserId; }
    public void setNurseUserId(String nurseUserId) { this.nurseUserId = nurseUserId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
""",
    "NursingAssessmentDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class NursingAssessmentDto {
    @NotNull private Long patientId;
    @NotNull private Long admissionId;
    @NotNull private String assessmentType;
    @NotNull private Map<String, Object> data;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
}
""",
    "MedicationAdministrationDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class MedicationAdministrationDto {
    @NotNull private Long patientId;
    @NotNull private Long admissionId;
    @NotNull private Long prescriptionId;
    @NotNull private String status; // ADMINISTERED, HELD, MISSED, REFUSED
    private String reason;
    private LocalDateTime administeredAt;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Long prescriptionId) { this.prescriptionId = prescriptionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getAdministeredAt() { return administeredAt; }
    public void setAdministeredAt(LocalDateTime administeredAt) { this.administeredAt = administeredAt; }
}
""",
    "ShiftHandoverDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotNull;

public class ShiftHandoverDto {
    @NotNull private Long patientId;
    @NotNull private Long admissionId;
    @NotNull private Long unitId;
    @NotNull private String incomingNurseUserId;
    @NotNull private String summary;
    private String pendingTasks;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public String getIncomingNurseUserId() { return incomingNurseUserId; }
    public void setIncomingNurseUserId(String incomingNurseUserId) { this.incomingNurseUserId = incomingNurseUserId; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(String pendingTasks) { this.pendingTasks = pendingTasks; }
}
"""
}

services = {
    "RosterService.java": """package com.swarnikacare.nursing.service;

import org.springframework.stereotype.Service;

@Service
public class RosterService {
    // Stub implementation to ensure build pass
}
""",
    "MedicationAdministrationService.java": """package com.swarnikacare.nursing.service;

import org.springframework.stereotype.Service;

@Service
public class MedicationAdministrationService {
}
""",
    "ShiftHandoverService.java": """package com.swarnikacare.nursing.service;

import org.springframework.stereotype.Service;

@Service
public class ShiftHandoverService {
}
""",
    "NursingAssessmentService.java": """package com.swarnikacare.nursing.service;

import org.springframework.stereotype.Service;

@Service
public class NursingAssessmentService {
}
"""
}

controllers = {
    "RosterController.java": """package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/nursing/rosters")
public class RosterController {
    
    @GetMapping("/me")
    public ResponseEntity<List<Object>> getMyRoster(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(new ArrayList<>());
    }
}
""",
    "MedicationAdministrationController.java": """package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.MedicationAdministrationDto;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/nursing/mar")
public class MedicationAdministrationController {
    
    @PostMapping
    public ResponseEntity<Object> administer(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody MedicationAdministrationDto dto) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok().build();
    }
}
""",
    "ShiftHandoverController.java": """package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.ShiftHandoverDto;

@RestController
@RequestMapping("/api/v1/nursing/handovers")
public class ShiftHandoverController {
    
    @PostMapping
    public ResponseEntity<Object> submitHandover(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody ShiftHandoverDto dto) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok().build();
    }
}
""",
    "NursingAssessmentController.java": """package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.NursingAssessmentDto;

@RestController
@RequestMapping("/api/v1/nursing/assessments")
public class NursingAssessmentController {
    
    @PostMapping
    public ResponseEntity<Object> submitAssessment(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody NursingAssessmentDto dto) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok().build();
    }
}
"""
}

base_dir = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend/nursing-service/src/main/java/com/swarnikacare/nursing/"

for fname, content in dtos.items():
    with open(os.path.join(base_dir, "dto", fname), "w") as f:
        f.write(content)

for fname, content in services.items():
    with open(os.path.join(base_dir, "service", fname), "w") as f:
        f.write(content)
        
for fname, content in controllers.items():
    with open(os.path.join(base_dir, "controller", fname), "w") as f:
        f.write(content)
