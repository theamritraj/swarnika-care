package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.swarnikacare.nursing.dto.MedicationAdministrationDto;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/nursing/mar")
public class MedicationAdministrationController {
    
    @PostMapping
    public ResponseEntity<Object> administer(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody MedicationAdministrationDto dto) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok().build();
    }
}
