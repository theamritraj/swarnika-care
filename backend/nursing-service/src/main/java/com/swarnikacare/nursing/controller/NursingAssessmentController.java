package com.swarnikacare.nursing.controller;

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
