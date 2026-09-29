package com.swarnikacare.doctor.controller;

import com.swarnikacare.doctor.dto.DoctorAvailabilityRequest;
import com.swarnikacare.doctor.dto.DoctorAvailabilityResponse;
import com.swarnikacare.doctor.dto.DoctorCreateRequest;
import com.swarnikacare.doctor.dto.DoctorDirectoryResponse;
import com.swarnikacare.doctor.dto.DoctorResponse;
import com.swarnikacare.doctor.dto.DoctorUpdateRequest;
import com.swarnikacare.doctor.entity.DoctorAvailability;
import com.swarnikacare.doctor.repository.DoctorAvailabilityRepository;
import com.swarnikacare.doctor.security.ScopeValidator;
import com.swarnikacare.doctor.service.DoctorAvailabilityService;
import com.swarnikacare.doctor.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorAvailabilityService availabilityService;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final ScopeValidator scopeValidator;

    public DoctorController(
            DoctorService doctorService,
            DoctorAvailabilityService availabilityService,
            DoctorAvailabilityRepository availabilityRepository,
            ScopeValidator scopeValidator) {
        this.doctorService = doctorService;
        this.availabilityService = availabilityService;
        this.availabilityRepository = availabilityRepository;
        this.scopeValidator = scopeValidator;
    }

    // --- Doctor Endpoints ---

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getAllDoctors() {
        List<DoctorResponse> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(createSuccessResponse("Doctors retrieved successfully", doctors));
    }

    @GetMapping("/directory")
    @PreAuthorize("#hospitalId == null or @scopeValidator.canAccessHospital(authentication, #hospitalId)")
    public ResponseEntity<Map<String, Object>> getDoctorDirectory(
            @RequestParam(value = "hospitalId", required = false) Long hospitalId,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "search", required = false) String search) {
        List<DoctorDirectoryResponse> directory = doctorService.getDoctorDirectory(hospitalId, departmentId, search);
        return ResponseEntity.ok(createSuccessResponse("Doctor directory retrieved successfully", directory));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createDoctor(@Valid @RequestBody DoctorCreateRequest request) {
        DoctorResponse doctor = doctorService.createDoctor(request);
        return new ResponseEntity<>(createSuccessResponse("Doctor created successfully", doctor), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getDoctorById(@PathVariable Long id) {
        DoctorResponse doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(createSuccessResponse("Doctor retrieved successfully", doctor));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateDoctor(
            @PathVariable Long id, 
            @Valid @RequestBody DoctorUpdateRequest request) {
        DoctorResponse doctor = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(createSuccessResponse("Doctor updated successfully", doctor));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(createSuccessResponse("Doctor deleted successfully", null));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication authentication) {
        String userId = authentication.getName();
        DoctorResponse doctor = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(createSuccessResponse("Profile retrieved successfully", doctor));
    }

    // --- Availability Endpoints ---

    @GetMapping("/availability")
    @PreAuthorize("#hospitalId == null or @scopeValidator.canAccessHospital(authentication, #hospitalId)")
    public ResponseEntity<Map<String, Object>> getGlobalAvailability(
            @RequestParam(value = "hospitalId", required = false) Long hospitalId,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "doctorId", required = false) Long doctorId) {
        List<DoctorAvailabilityResponse> availability = availabilityService.getAvailability(hospitalId, departmentId, doctorId);
        return ResponseEntity.ok(createSuccessResponse("Availability retrieved successfully", availability));
    }

    @PostMapping("/{id}/availability")
    @PreAuthorize("@scopeValidator.canAccessHospital(authentication, #request.hospitalId) and hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> addAvailability(
            @PathVariable Long id,
            @Valid @RequestBody DoctorAvailabilityRequest request) {
        DoctorAvailabilityResponse availability = availabilityService.addAvailability(id, request);
        return new ResponseEntity<>(createSuccessResponse("Availability added successfully", availability), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/availability")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> getAvailability(@PathVariable Long id) {
        List<DoctorAvailabilityResponse> availability = availabilityService.getAvailabilityByDoctor(id);
        return ResponseEntity.ok(createSuccessResponse("Availability retrieved successfully", availability));
    }

    @DeleteMapping("/availability/{availabilityId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteAvailability(
            @PathVariable Long availabilityId,
            Authentication authentication) {
        DoctorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with id: " + availabilityId));

        if (!scopeValidator.canAccessHospital(authentication, availability.getHospitalId())) {
            throw new AccessDeniedException("Access denied: You do not have permission to delete availability for this hospital");
        }

        availabilityService.deleteAvailability(availabilityId);
        return ResponseEntity.ok(createSuccessResponse("Availability deleted successfully", null));
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
