package com.swarnikacare.notification.service;

import com.swarnikacare.notification.entity.Notification;
import com.swarnikacare.notification.entity.ProcessedEvent;
import com.swarnikacare.notification.repository.NotificationRepository;
import com.swarnikacare.notification.repository.ProcessedEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);
    
    private final ProcessedEventRepository processedEventRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationDispatcher dispatcher;
    private final ObjectMapper objectMapper;

    public NotificationConsumer(ProcessedEventRepository processedEventRepository, 
                              NotificationRepository notificationRepository,
                              NotificationDispatcher dispatcher,
                              ObjectMapper objectMapper) {
        this.processedEventRepository = processedEventRepository;
        this.notificationRepository = notificationRepository;
        this.dispatcher = dispatcher;
        this.objectMapper = objectMapper;
    }

    // Generic listener for standard business events
    @KafkaListener(topics = "${app.kafka.topics.appointment-booked:swarnika.appointment.booked}", groupId = "notification-group")
    @Transactional
    public void consumeAppointmentBooked(String payload) {
        log.info("Received appointment booked event: {}", payload);
        
        try {
            com.swarnikacare.notification.dto.AppointmentBookedEvent event = objectMapper.readValue(payload, com.swarnikacare.notification.dto.AppointmentBookedEvent.class);
            String eventId = event.getEventId();
            
            if (eventId == null || eventId.isEmpty()) {
                log.error("Event ID missing in payload");
                throw new IllegalArgumentException("Malformed event: eventId is missing");
            }

            if (processedEventRepository.existsByEventId(eventId)) {
                log.info("Event {} already processed. Idempotency kicking in.", eventId);
                return;
            }

            // Create the In-App notification
            Notification inApp = new Notification();
            inApp.setEventId(eventId);
            inApp.setEventType("APPOINTMENT_CREATED");
            inApp.setChannel("IN_APP");
            inApp.setRecipientUserId(event.getPatientId() != null ? event.getPatientId().toString() : null);
            inApp.setTitle("Appointment Confirmed");
            inApp.setContent("Your appointment has been successfully booked.");
            
            // Create the Email notification
            Notification email = new Notification();
            email.setEventId(eventId);
            email.setEventType("APPOINTMENT_CREATED");
            email.setChannel("EMAIL");
            email.setRecipientUserId(event.getPatientId() != null ? event.getPatientId().toString() : null);
            email.setRecipientEmail(event.getPatientEmail());
            email.setTitle("Swarnika Care: Appointment Confirmed");
            email.setContent("Dear " + (event.getPatientName() != null ? event.getPatientName() : "Patient") + 
                    ", your appointment with " + event.getDoctorName() + 
                    " at " + event.getHospitalName() + " on " + event.getAppointmentDate() + 
                    " is confirmed. Please login to the portal to view details.");

            notificationRepository.save(inApp);
            notificationRepository.save(email);
            
            ProcessedEvent processedEvent = new ProcessedEvent();
            processedEvent.setEventId(eventId);
            processedEvent.setEventType("APPOINTMENT_CREATED");
            processedEventRepository.save(processedEvent);
            
            dispatcher.dispatch(inApp);
            dispatcher.dispatch(email);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Failed to parse event payload: {}", payload, e);
            throw new RuntimeException("Failed to deserialize event payload", e);
        }
    }
}
