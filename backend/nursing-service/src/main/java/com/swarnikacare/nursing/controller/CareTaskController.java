package com.swarnikacare.nursing.controller;

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
