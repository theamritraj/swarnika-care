package com.swarnikacare.notification.controller;

import com.swarnikacare.notification.dto.DoctorWelcomeNotificationRequest;
import com.swarnikacare.notification.entity.NotificationEvent;
import com.swarnikacare.notification.repository.NotificationEventRepository;
import com.swarnikacare.notification.service.EmailService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final EmailService emailService;
    private final NotificationEventRepository notificationEventRepository;

    public NotificationController(EmailService emailService, NotificationEventRepository notificationEventRepository) {
        this.emailService = emailService;
        this.notificationEventRepository = notificationEventRepository;
    }

    @PostMapping("/doctor-welcome")
    public ResponseEntity<Map<String, Object>> sendDoctorWelcome(@Valid @RequestBody DoctorWelcomeNotificationRequest request) {
        log.info("Received request to send doctor welcome email: eventId={}, doctorEmail={}", 
                request.getEventId(), request.getDoctorEmail());

        // 1. Idempotency Check
        Optional<NotificationEvent> existing = notificationEventRepository.findByEventId(request.getEventId());
        NotificationEvent eventRecord;

        if (existing.isPresent()) {
            eventRecord = existing.get();
            if ("SENT".equals(eventRecord.getStatus())) {
                log.info("Event {} was already successfully SENT. Skipping duplicate dispatch.", request.getEventId());
                Map<String, Object> resp = new HashMap<>();
                resp.put("success", true);
                resp.put("status", "SENT");
                resp.put("message", "Welcome email already sent (idempotent duplicate skipped)");
                return ResponseEntity.ok(resp);
            }
        } else {
            eventRecord = new NotificationEvent(request.getEventId(), "DOCTOR_ONBOARDING_COMPLETED", "PROCESSING");
            eventRecord = notificationEventRepository.save(eventRecord);
        }

        try {
            Map<String, Object> templateModel = new HashMap<>();
            templateModel.put("doctorName", request.getDoctorName());
            templateModel.put("hospitalName", request.getHospitalName() != null ? request.getHospitalName() : "Swarnika Hospitals");
            templateModel.put("departmentName", request.getDepartmentName() != null ? request.getDepartmentName() : "Clinical Department");
            templateModel.put("designation", request.getDesignation() != null ? request.getDesignation() : "Consultant");
            templateModel.put("loginEmail", request.getDoctorEmail());
            templateModel.put("portalUrl", request.getPortalUrl() != null ? request.getPortalUrl() : "http://localhost:3001/login");
            templateModel.put("engagementType", request.getEngagementType() != null ? request.getEngagementType() : "In-House Clinical");
            templateModel.put("year", String.valueOf(java.time.Year.now().getValue()));

            emailService.sendDoctorWelcomeEmail(request.getDoctorEmail(), templateModel);

            eventRecord.setStatus("SENT");
            eventRecord.setProcessedAt(LocalDateTime.now());
            notificationEventRepository.save(eventRecord);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("status", "SENT");
            resp.put("message", "Welcome email dispatched successfully");
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            log.error("Failed to dispatch doctor welcome email for event {}", request.getEventId(), e);
            eventRecord.setStatus("FAILED");
            eventRecord.setProcessedAt(LocalDateTime.now());
            notificationEventRepository.save(eventRecord);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", false);
            resp.put("status", "FAILED");
            resp.put("message", "Failed to dispatch email: " + e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }
}
