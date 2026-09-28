package com.swarnikacare.nursing.controller;

import com.swarnikacare.nursing.entity.ShiftTemplate;
import com.swarnikacare.nursing.service.ShiftTemplateService;
import com.swarnikacare.nursing.dto.ShiftTemplateDto;
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
@RequestMapping("/api/v1/nursing/shifts/templates")
public class ShiftTemplateController {
    @Autowired
    private ShiftTemplateService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'NURSE')")
    public ResponseEntity<List<ShiftTemplate>> getTemplates(
            Authentication authentication,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);
        if (authHospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(service.findByHospitalId(authHospitalId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<ShiftTemplate> createTemplate(
            Authentication authentication,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId,
            @Valid @RequestBody ShiftTemplateDto dto) {
        Long authHospitalId = resolveHospitalId(authentication, hospitalId);
        if (authHospitalId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        
        ShiftTemplate template = new ShiftTemplate();
        template.setHospitalId(authHospitalId);
        template.setName(dto.getName());
        template.setCode(dto.getCode());
        template.setStartTime(dto.getStartTime());
        template.setEndTime(dto.getEndTime());
        
        return ResponseEntity.ok(service.save(template));
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
