package com.swarnikacare.nursing.controller;

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
