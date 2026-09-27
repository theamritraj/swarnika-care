package com.swarnikacare.encounter.controller;

import com.swarnikacare.encounter.dto.EncounterResponse;
import com.swarnikacare.encounter.dto.OpdEncounterRequest;
import com.swarnikacare.encounter.service.EncounterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/opd")
public class OpdController {

    private final EncounterService encounterService;

    public OpdController(EncounterService encounterService) {
        this.encounterService = encounterService;
    }

    @PostMapping("/encounters")
    public ResponseEntity<Map<String, Object>> createOpdEncounter(@Valid @RequestBody OpdEncounterRequest request) {
        EncounterResponse response = encounterService.createOpdEncounter(request);
        return new ResponseEntity<>(createSuccessResponse("OPD encounter created successfully", response), HttpStatus.CREATED);
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        if (data != null) {
            response.put("data", data);
        }
        return response;
    }
}
