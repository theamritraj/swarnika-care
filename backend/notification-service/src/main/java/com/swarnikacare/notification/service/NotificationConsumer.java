package com.swarnikacare.notification.service;

import com.swarnikacare.notification.entity.Notification;
import com.swarnikacare.notification.entity.ProcessedEvent;
import com.swarnikacare.notification.repository.NotificationRepository;
import com.swarnikacare.notification.repository.ProcessedEventRepository;
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

    public NotificationConsumer(ProcessedEventRepository processedEventRepository, 
                              NotificationRepository notificationRepository,
                              NotificationDispatcher dispatcher) {
        this.processedEventRepository = processedEventRepository;
        this.notificationRepository = notificationRepository;
        this.dispatcher = dispatcher;
    }

    // Generic listener for standard business events
    @KafkaListener(topics = "${app.kafka.topics.appointment-booked:swarnika.appointment.booked}", groupId = "notification-group")
    @Transactional
    public void consumeAppointmentBooked(String payload) {
        log.info("Received appointment booked event: {}", payload);
        
        // Simplistic parsing for demo purposes. Real implementation uses Jackson to deserialize to NotificationEvent DTO
        String eventId = extractJsonValue(payload, "eventId");
        
        if (eventId == null || eventId.isEmpty()) {
            log.error("Event ID missing in payload");
            return;
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
        inApp.setRecipientUserId(extractJsonValue(payload, "patientId"));
        inApp.setTitle("Appointment Confirmed");
        inApp.setContent("Your appointment has been successfully booked.");
        
        // Create the Email notification
        Notification email = new Notification();
        email.setEventId(eventId);
        email.setEventType("APPOINTMENT_CREATED");
        email.setChannel("EMAIL");
        email.setRecipientUserId(extractJsonValue(payload, "patientId"));
        email.setRecipientEmail(extractJsonValue(payload, "patientEmail"));
        email.setTitle("Swarnika Care: Appointment Confirmed");
        email.setContent("Dear Patient, your appointment is confirmed. Please login to the portal to view details.");

        notificationRepository.save(inApp);
        notificationRepository.save(email);
        
        ProcessedEvent processedEvent = new ProcessedEvent();
        processedEvent.setEventId(eventId);
        processedEvent.setEventType("APPOINTMENT_CREATED");
        processedEventRepository.save(processedEvent);
        
        // Async dispatch could be used here. For now synchronous dispatch.
        dispatcher.dispatch(inApp);
        dispatcher.dispatch(email);
    }
    
    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\":\"";
        int start = json.indexOf(searchKey);
        if (start == -1) return "mock-id-123"; // fallback for crude parsing
        start += searchKey.length();
        int end = json.indexOf("\"", start);
        return json.substring(start, end);
    }
}
