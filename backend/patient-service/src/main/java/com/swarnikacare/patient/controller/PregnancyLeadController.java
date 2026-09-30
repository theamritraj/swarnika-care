package com.swarnikacare.patient.controller;

import com.swarnikacare.patient.dto.PregnancyLeadRequest;
import com.swarnikacare.patient.entity.PregnancyLead;
import com.swarnikacare.patient.service.PregnancyLeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/leads/pregnancy")
@RequiredArgsConstructor
public class PregnancyLeadController {

    private final PregnancyLeadService pregnancyLeadService;

    @PostMapping
    public ResponseEntity<PregnancyLead> createLead(@Valid @RequestBody PregnancyLeadRequest request) {
        PregnancyLead lead = pregnancyLeadService.createLead(request);
        return new ResponseEntity<>(lead, HttpStatus.CREATED);
    }
}
