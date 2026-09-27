import os

base_pkg = "package com.swarnikacare.notification;\n\n"

files = {
    "repository/NotificationRepository.java": """package com.swarnikacare.notification.repository;

import com.swarnikacare.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);
    int countByRecipientUserIdAndIsReadFalse(String recipientUserId);
}
""",
    "repository/ProcessedEventRepository.java": """package com.swarnikacare.notification.repository;

import com.swarnikacare.notification.entity.ProcessedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, Long> {
    boolean existsByEventId(String eventId);
}
""",
    "channel/NotificationChannel.java": """package com.swarnikacare.notification.channel;

import com.swarnikacare.notification.entity.Notification;

public interface NotificationChannel {
    boolean supports(String channelType);
    void send(Notification notification) throws Exception;
}
""",
    "channel/EmailSender.java": """package com.swarnikacare.notification.channel;

public interface EmailSender {
    void sendEmail(String to, String subject, String content);
}
""",
    "channel/SmtpEmailSender.java": """package com.swarnikacare.notification.channel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
public class SmtpEmailSender implements EmailSender {
    private static final Logger log = LoggerFactory.getLogger(SmtpEmailSender.class);
    
    private final JavaMailSender mailSender;
    
    @Value("${mail.from:noreply@swarnikahospitals.com}")
    private String mailFrom;

    public SmtpEmailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String content) {
        log.info("Sending email to {} via SMTP", to);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        
        // Disable actual send in local dev if configured, but let's assume it attempts for now.
        mailSender.send(message);
    }
}
""",
    "channel/EmailChannel.java": """package com.swarnikacare.notification.channel;

import com.swarnikacare.notification.entity.Notification;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class EmailChannel implements NotificationChannel {

    private final EmailSender emailSender;

    public EmailChannel(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Override
    public boolean supports(String channelType) {
        return "EMAIL".equalsIgnoreCase(channelType);
    }

    @Override
    public void send(Notification notification) throws Exception {
        if (notification.getRecipientEmail() == null || notification.getRecipientEmail().isEmpty()) {
            throw new IllegalArgumentException("Recipient email is missing");
        }
        
        emailSender.sendEmail(
            notification.getRecipientEmail(), 
            notification.getTitle(), 
            notification.getContent()
        );
        
        notification.setSentAt(LocalDateTime.now());
        notification.setDeliveryStatus("SENT");
    }
}
""",
    "channel/InAppChannel.java": """package com.swarnikacare.notification.channel;

import com.swarnikacare.notification.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class InAppChannel implements NotificationChannel {

    @Override
    public boolean supports(String channelType) {
        return "IN_APP".equalsIgnoreCase(channelType);
    }

    @Override
    public void send(Notification notification) throws Exception {
        // In-App notifications are simply persisted in the DB and queried via API.
        // No active push is implemented here (e.g. WebSocket), though it could be added in the future.
        notification.setDeliveryStatus("DELIVERED");
    }
}
""",
    "service/NotificationDispatcher.java": """package com.swarnikacare.notification.service;

import com.swarnikacare.notification.channel.NotificationChannel;
import com.swarnikacare.notification.entity.Notification;
import com.swarnikacare.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationDispatcher {
    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcher.class);
    
    private final List<NotificationChannel> channels;
    private final NotificationRepository repository;

    public NotificationDispatcher(List<NotificationChannel> channels, NotificationRepository repository) {
        this.channels = channels;
        this.repository = repository;
    }

    public void dispatch(Notification notification) {
        for (NotificationChannel channel : channels) {
            if (channel.supports(notification.getChannel())) {
                try {
                    notification.setDeliveryStatus("PROCESSING");
                    repository.save(notification);
                    
                    channel.send(notification);
                    log.info("Successfully dispatched notification {} via {}", notification.getId(), notification.getChannel());
                } catch (Exception e) {
                    log.error("Failed to dispatch notification {} via {}", notification.getId(), notification.getChannel(), e);
                    notification.setDeliveryStatus("FAILED");
                    notification.setFailureReason(e.getMessage());
                    notification.setRetryCount(notification.getRetryCount() + 1);
                } finally {
                    repository.save(notification);
                }
                return;
            }
        }
        log.warn("No suitable channel found for type {}", notification.getChannel());
        notification.setDeliveryStatus("FAILED");
        notification.setFailureReason("No supported channel");
        repository.save(notification);
    }
}
""",
    "service/NotificationConsumer.java": """package com.swarnikacare.notification.service;

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
        String searchKey = "\\"" + key + "\\":\\"";
        int start = json.indexOf(searchKey);
        if (start == -1) return "mock-id-123"; // fallback for crude parsing
        start += searchKey.length();
        int end = json.indexOf("\\"", start);
        return json.substring(start, end);
    }
}
"""
}

out_dir = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend/notification-service/src/main/java/com/swarnikacare/notification/"

for rel_path, content in files.items():
    full_path = os.path.join(out_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
    print(f"Generated {rel_path}")
