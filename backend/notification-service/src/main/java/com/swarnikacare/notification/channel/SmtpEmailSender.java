package com.swarnikacare.notification.channel;

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
