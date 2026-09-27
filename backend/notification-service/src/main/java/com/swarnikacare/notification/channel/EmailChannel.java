package com.swarnikacare.notification.channel;

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
