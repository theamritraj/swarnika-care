package com.swarnikacare.organization.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.swarnikacare.organization.service.EmployeeService;
import com.swarnikacare.organization.service.PositionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/hospitals/{hospitalId}")
public class HospitalScopeController {
    private final EmployeeService employeeService;
    private final PositionService positionService;

    public HospitalScopeController(EmployeeService employeeService, PositionService positionService) {
        this.employeeService = employeeService;
        this.positionService = positionService;
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #hospitalId)")
    @GetMapping("/employees")
    public ResponseEntity<Map<String, Object>> getEmployees(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(Map.of("success", true, "data", employeeService.getByHospitalId(hospitalId)));
    }

    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #hospitalId)")
    @GetMapping("/positions")
    public ResponseEntity<Map<String, Object>> getPositions(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(Map.of("success", true, "data", positionService.getByHospitalId(hospitalId)));
    }
}
