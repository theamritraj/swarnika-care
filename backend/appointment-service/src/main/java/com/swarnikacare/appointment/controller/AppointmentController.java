package com.swarnikacare.appointment.controller;

import com.swarnikacare.appointment.dto.*;
import com.swarnikacare.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping({"", "/", "/getAllAppointments"})
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> getAllAppointments() {
        return ResponseEntity.ok(success("Appointments retrieved successfully", appointmentService.getAllAppointments()));
    }

    @PostMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<Map<String, Object>> createAppointment(@Valid @RequestBody AppointmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(success("Appointment created successfully", appointmentService.createAppointment(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(success("Appointment retrieved successfully", appointmentService.getAppointmentById(id)));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> getAppointmentsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(success("Appointments retrieved successfully", appointmentService.getAppointmentsByPatient(patientId)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> getAppointmentsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(success("Appointments retrieved successfully", appointmentService.getAppointmentsByDoctor(doctorId)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> updateAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentUpdateRequest request) {
        return ResponseEntity.ok(success("Appointment updated successfully", appointmentService.updateAppointment(id, request)));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> cancelAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentCancelRequest request) {
        return ResponseEntity.ok(success("Appointment cancelled successfully", appointmentService.cancelAppointment(id, request)));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR')")
    public ResponseEntity<Map<String, Object>> completeAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(success("Appointment marked as completed successfully", appointmentService.completeAppointment(id)));
    }
    
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> confirmAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(success("Appointment confirmed successfully", appointmentService.confirmAppointment(id)));
    }

    @PatchMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> noShowAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(success("Appointment marked as no-show successfully", appointmentService.noShowAppointment(id)));
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<Map<String, Object>> rescheduleAppointment(@PathVariable Long id, @Valid @RequestBody AppointmentRescheduleRequest request) {
        return ResponseEntity.ok(success("Appointment rescheduled successfully", appointmentService.rescheduleAppointment(id, request)));
    }

    private Map<String, Object> success(String message, Object data) {
        return data == null 
                ? Map.of("success", true, "message", message)
                : Map.of("success", true, "message", message, "data", data);
    }
}
