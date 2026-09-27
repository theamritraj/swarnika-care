package com.swarnikacare.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swarnikacare.notification.entity.NotificationEvent;
import com.swarnikacare.notification.event.AppointmentBookedEvent;
import com.swarnikacare.notification.repository.NotificationEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    private final EmailService emailService;
    private final NotificationEventRepository notificationEventRepository;
    private final ObjectMapper objectMapper;

    public NotificationConsumer(EmailService emailService, NotificationEventRepository notificationEventRepository, ObjectMapper objectMapper) {
        this.emailService = emailService;
        this.notificationEventRepository = notificationEventRepository;
        this.objectMapper = objectMapper;
    }

    @org.springframework.kafka.annotation.RetryableTopic(
            attempts = "3",
            backoff = @org.springframework.retry.annotation.Backoff(delay = 5000, multiplier = 2.0),
            autoCreateTopics = "false",
            dltTopicSuffix = ".dlq"
    )
    @KafkaListener(topics = "${app.kafka.topics.appointment-booked:swarnika.appointment.booked}", groupId = "notification-group")
    public void consumeAppointmentEvent(@Payload String messagePayload) {
        log.info("Received AppointmentBookedEvent payload: {}", messagePayload);
        
        try {
            AppointmentBookedEvent event = objectMapper.readValue(messagePayload, AppointmentBookedEvent.class);
            
            // 1. Idempotency Check with Stale Processing Recovery
            Optional<NotificationEvent> existingEvent = notificationEventRepository.findByEventId(event.getEventId());
            NotificationEvent notificationEvent;
            
            if (existingEvent.isPresent()) {
                notificationEvent = existingEvent.get();
                if ("SENT".equals(notificationEvent.getStatus())) {
                    log.info("Event {} already successfully SENT. Skipping.", event.getEventId());
                    return;
                }
                
                if ("PROCESSING".equals(notificationEvent.getStatus())) {
                    // Stale check (e.g. if consumer crashed while processing 5+ minutes ago)
                    if (notificationEvent.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(5))) {
                        log.warn("Event {} is stuck in PROCESSING for over 5 minutes. Retrying.", event.getEventId());
                    } else {
                        log.info("Event {} is currently PROCESSING by another thread/consumer. Skipping.", event.getEventId());
                        return;
                    }
                }
            } else {
                notificationEvent = new NotificationEvent(event.getEventId(), event.getEventType(), "PROCESSING");
                try {
                    notificationEvent = notificationEventRepository.save(notificationEvent);
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    log.warn("Race condition caught: Event {} already inserted by another consumer.", event.getEventId());
                    return;
                }
            }

            // 2. Mark as Processing (if it was FAILED or stale PROCESSING)
            notificationEvent.setStatus("PROCESSING");
            notificationEventRepository.save(notificationEvent);

            // 3. Build Template Model
            Map<String, Object> templateModel = new HashMap<>();
            templateModel.put("patientName", event.getPatientName());
            templateModel.put("uhid", event.getUhid() != null ? event.getUhid() : "SH.N/A");
            templateModel.put("date", event.getAppointmentDate());
            templateModel.put("time", event.getTimeSlot());
            templateModel.put("doctorName", event.getDoctorName());
            templateModel.put("specialty", event.getSpecialty());
            templateModel.put("hospitalName", event.getHospitalName());
            templateModel.put("hospitalAddress", event.getHospitalAddress());
            templateModel.put("location", event.getLocation());

            // 4. Send Email
            if (event.getPatientEmail() != null && !event.getPatientEmail().isEmpty()) {
                try {
                    emailService.sendAppointmentConfirmationEmail(event.getPatientEmail(), templateModel);
                    
                    // 5. Update Status to SENT
                    notificationEvent.setStatus("SENT");
                    notificationEvent.setProcessedAt(LocalDateTime.now());
                    notificationEventRepository.save(notificationEvent);
                    log.info("Successfully processed AppointmentBookedEvent for appointment {}", event.getAppointmentId());
                } catch (Exception e) {
                    // Mark as failed in DB, then rethrow to trigger Kafka Retry
                    notificationEvent.setStatus("FAILED");
                    notificationEventRepository.save(notificationEvent);
                    log.error("Failed to send email for event {}. Will trigger retry.", event.getEventId(), e);
                    throw new RuntimeException("Email delivery failed", e);
                }
            } else {
                log.warn("Patient email is missing for event {}. Cannot send email.", event.getEventId());
                notificationEvent.setStatus("FAILED");
                notificationEventRepository.save(notificationEvent);
            }

        } catch (Exception e) {
            log.error("Failed to process AppointmentBookedEvent", e);
            throw new RuntimeException("Error processing event", e);
        }
    }
}
