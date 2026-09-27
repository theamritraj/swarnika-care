package com.swarnikacare.nursing.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/nursing/rosters")
public class RosterController {
    
    @GetMapping("/me")
    public ResponseEntity<List<Object>> getMyRoster(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-Hospital-Id", required = false) Long hospitalId) {
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(new ArrayList<>());
    }
}
