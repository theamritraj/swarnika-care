import os

dtos = {
    "ShiftTemplateDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public class ShiftTemplateDto {
    @NotBlank
    private String name;
    @NotBlank
    private String code;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}
""",
    "NursingNoteDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NursingNoteDto {
    @NotNull
    private Long admissionId;
    @NotBlank
    private String noteType;
    @NotBlank
    private String content;

    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public String getNoteType() { return noteType; }
    public void setNoteType(String noteType) { this.noteType = noteType; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
""",
    "CareTaskDto.java": """package com.swarnikacare.nursing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CareTaskDto {
    @NotNull
    private Long patientId;
    @NotNull
    private Long admissionId;
    @NotNull
    private Long unitId;
    @NotBlank
    private String taskType;
    private String priority;
    private LocalDateTime scheduledAt;
    private LocalDateTime dueAt;
    private String notes;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getAdmissionId() { return admissionId; }
    public void setAdmissionId(Long admissionId) { this.admissionId = admissionId; }
    public Long getUnitId() { return unitId; }
    public void setUnitId(Long unitId) { this.unitId = unitId; }
    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
"""
}

services = {
    "ShiftTemplateService.java": """package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.ShiftTemplate;
import com.swarnikacare.nursing.repository.ShiftTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ShiftTemplateService {
    @Autowired
    private ShiftTemplateRepository repository;

    public List<ShiftTemplate> findByHospitalId(Long hospitalId) {
        // Normally you'd add a repository method findByHospitalId, for now we assume it exists or will be added
        return repository.findAll().stream().filter(s -> s.getHospitalId().equals(hospitalId)).toList();
    }
    
    public ShiftTemplate save(ShiftTemplate template) {
        return repository.save(template);
    }
}
""",
    "NursingNoteService.java": """package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.NursingNote;
import com.swarnikacare.nursing.repository.NursingNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NursingNoteService {
    @Autowired
    private NursingNoteRepository repository;

    public List<NursingNote> findByPatientId(Long patientId) {
        return repository.findAll().stream().filter(n -> n.getPatientId().equals(patientId)).toList();
    }
    
    public NursingNote save(NursingNote note) {
        return repository.save(note);
    }
}
""",
    "CareTaskService.java": """package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.CareTask;
import com.swarnikacare.nursing.repository.CareTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CareTaskService {
    @Autowired
    private CareTaskRepository repository;

    public List<CareTask> findMyTasks(String nurseUserId, Long hospitalId) {
        return repository.findAll().stream()
            .filter(t -> nurseUserId.equals(t.getAssignedNurseUserId()) && hospitalId.equals(t.getHospitalId()))
            .toList();
    }
    
    public CareTask save(CareTask task) {
        return repository.save(task);
    }

    public CareTask findById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
"""
}

controllers = {
    "ShiftTemplateController.java": """package com.swarnikacare.nursing.controller;

import com.swarnikacare.nursing.entity.ShiftTemplate;
import com.swarnikacare.nursing.service.ShiftTemplateService;
import com.swarnikacare.nursing.dto.ShiftTemplateDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nursing/shifts/templates")
public class ShiftTemplateController {
    @Autowired
    private ShiftTemplateService service;

    @GetMapping
    public ResponseEntity<List<ShiftTemplate>> getTemplates(
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        if (hospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(service.findByHospitalId(hospitalId));
    }

    @PostMapping
    public ResponseEntity<ShiftTemplate> createTemplate(
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody ShiftTemplateDto dto) {
        if (hospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        ShiftTemplate template = new ShiftTemplate();
        template.setHospitalId(hospitalId);
        template.setName(dto.getName());
        template.setCode(dto.getCode());
        template.setStartTime(dto.getStartTime());
        template.setEndTime(dto.getEndTime());
        
        return ResponseEntity.ok(service.save(template));
    }
}
""",
    "NursingNoteController.java": """package com.swarnikacare.nursing.controller;

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
""",
    "CareTaskController.java": """package com.swarnikacare.nursing.controller;

import com.swarnikacare.nursing.entity.CareTask;
import com.swarnikacare.nursing.service.CareTaskService;
import com.swarnikacare.nursing.service.PatientAssignmentService;
import com.swarnikacare.nursing.dto.CareTaskDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nursing/tasks")
public class CareTaskController {
    @Autowired
    private CareTaskService taskService;

    @Autowired
    private PatientAssignmentService assignmentService;

    @GetMapping("/my")
    public ResponseEntity<List<CareTask>> getMyTasks(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        if (userId == null || hospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(taskService.findMyTasks(userId, hospitalId));
    }

    @PostMapping
    public ResponseEntity<CareTask> createTask(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody CareTaskDto dto) {
        if (userId == null || hospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        if (!assignmentService.isPatientAssignedToNurse(dto.getPatientId(), userId, hospitalId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CareTask task = new CareTask();
        task.setPatientId(dto.getPatientId());
        task.setAdmissionId(dto.getAdmissionId());
        task.setHospitalId(hospitalId);
        task.setUnitId(dto.getUnitId());
        task.setAssignedNurseUserId(userId);
        task.setTaskType(dto.getTaskType());
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : "ROUTINE");
        task.setScheduledAt(dto.getScheduledAt());
        task.setDueAt(dto.getDueAt());
        task.setNotes(dto.getNotes());
        task.setCreatedBy(userId);

        return ResponseEntity.ok(taskService.save(task));
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<CareTask> startTask(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        
        CareTask task = taskService.findById(id);
        if (task == null) return ResponseEntity.notFound().build();
        if (!task.getHospitalId().equals(hospitalId) || !userId.equals(task.getAssignedNurseUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        task.setStatus("IN_PROGRESS");
        return ResponseEntity.ok(taskService.save(task));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<CareTask> completeTask(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        
        CareTask task = taskService.findById(id);
        if (task == null) return ResponseEntity.notFound().build();
        if (!task.getHospitalId().equals(hospitalId) || !userId.equals(task.getAssignedNurseUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        return ResponseEntity.ok(taskService.save(task));
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
