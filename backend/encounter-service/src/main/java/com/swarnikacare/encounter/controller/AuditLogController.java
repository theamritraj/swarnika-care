package com.swarnikacare.encounter.controller;

import com.swarnikacare.encounter.dto.AuditLogRequest;
import com.swarnikacare.encounter.dto.AuditLogResponse;
import com.swarnikacare.encounter.entity.AuditLog;
import com.swarnikacare.encounter.repository.AuditLogRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> logAction(
            @Valid @RequestBody AuditLogRequest request,
            Authentication authentication) {
        AuditLog log = new AuditLog();
        log.setHospitalId(request.getHospitalId());
        
        String actor = (request.getActorUserId() != null && !request.getActorUserId().isEmpty())
                ? request.getActorUserId()
                : (authentication != null && authentication.getName() != null ? authentication.getName() : "RECEPTIONIST");
        log.setActorUserId(actor);

        String role = (request.getActorRole() != null && !request.getActorRole().isEmpty())
                ? request.getActorRole()
                : (authentication != null && !authentication.getAuthorities().isEmpty()
                    ? authentication.getAuthorities().iterator().next().getAuthority() : "RECEPTIONIST");
        log.setActorRole(role);

        log.setAction(request.getAction());
        log.setEntityType(request.getEntityType());
        log.setEntityId(request.getEntityId());
        log.setDetails(request.getDetails());
        log.setTimestamp(LocalDateTime.now());

        AuditLog saved = auditLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Audit log created successfully");
        response.put("data", mapToResponse(saved));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLogs(
            @RequestParam Long hospitalId,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false, defaultValue = "50") int limit) {
        PageRequest pageRequest = PageRequest.of(0, Math.min(limit, 100));
        List<AuditLog> list;
        if (entityType != null && !entityType.trim().isEmpty()) {
            list = auditLogRepository.findByHospitalIdAndEntityTypeOrderByTimestampDesc(hospitalId, entityType, pageRequest);
        } else {
            list = auditLogRepository.findByHospitalIdOrderByTimestampDesc(hospitalId, pageRequest);
        }

        List<AuditLogResponse> dtoList = list.stream().map(this::mapToResponse).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Audit logs retrieved successfully");
        response.put("data", dtoList);
        return ResponseEntity.ok(response);
    }

    private AuditLogResponse mapToResponse(AuditLog a) {
        AuditLogResponse r = new AuditLogResponse();
        r.setId(a.getId());
        r.setHospitalId(a.getHospitalId());
        r.setActorUserId(a.getActorUserId());
        r.setActorRole(a.getActorRole());
        r.setAction(a.getAction());
        r.setEntityType(a.getEntityType());
        r.setEntityId(a.getEntityId());
        r.setDetails(a.getDetails());
        r.setTimestamp(a.getTimestamp());
        return r;
    }
}
