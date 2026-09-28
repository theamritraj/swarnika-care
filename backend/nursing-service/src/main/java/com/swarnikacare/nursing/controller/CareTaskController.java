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

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nursing/tasks")
public class CareTaskController {
    @Autowired
    private CareTaskService taskService;

    @Autowired
    private PatientAssignmentService assignmentService;

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<List<CareTask>> getMyTasks(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);
        if (authUserId == null || authHospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(taskService.findMyTasks(authUserId, authHospitalId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<CareTask> createTask(
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody CareTaskDto dto) {
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);
        if (authUserId == null || authHospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        if (!assignmentService.isPatientAssignedToNurse(dto.getPatientId(), authUserId, authHospitalId)) {
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
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<CareTask> startTask(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        CareTask task = taskService.findById(id);
        if (task == null) return ResponseEntity.notFound().build();
        if (authHospitalId != null && !task.getHospitalId().equals(authHospitalId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (authUserId != null && !authUserId.equals(task.getAssignedNurseUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        task.setStatus("IN_PROGRESS");
        return ResponseEntity.ok(taskService.save(task));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('NURSE', 'SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<CareTask> completeTask(
            @PathVariable Long id,
            Authentication authentication,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        
        String authUserId = authentication != null ? authentication.getName() : userId;
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);

        CareTask task = taskService.findById(id);
        if (task == null) return ResponseEntity.notFound().build();
        if (authHospitalId != null && !task.getHospitalId().equals(authHospitalId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (authUserId != null && !authUserId.equals(task.getAssignedNurseUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        task.setStatus("COMPLETED");
        task.setCompletedAt(LocalDateTime.now());
        return ResponseEntity.ok(taskService.save(task));
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
