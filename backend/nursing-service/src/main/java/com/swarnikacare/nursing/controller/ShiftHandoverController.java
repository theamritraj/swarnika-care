package com.swarnikacare.nursing.controller;

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
