package com.swarnikacare.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Autowired
    public EmailService(JavaMailSender javaMailSender, TemplateEngine templateEngine) {
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }

    public void sendAppointmentConfirmationEmail(String toEmail, Map<String, Object> templateModel) {
        try {
            Context thymeleafContext = new Context();
            thymeleafContext.setVariables(templateModel);
            
            String htmlBody = templateEngine.process("appointment-confirmation", thymeleafContext);

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject("Swarnika Hospitals - Your Consultation Details - SWARNIKA HOSPITALS Appointment Confirmation");
            // The sender name cannot easily be overridden without proper configuration, 
            // but we can set it if the SMTP server allows it.
            helper.setFrom("swarnikahospitals@gmail.com", "Contact Swarnika");
            helper.setText(htmlBody, true); // true indicates HTML

            javaMailSender.send(message);
            log.info("✅ Appointment confirmation email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send appointment confirmation email to {}", toEmail, e);
            throw new RuntimeException("Failed to send appointment confirmation email", e);
        }
    }

    public void sendDoctorWelcomeEmail(String toEmail, Map<String, Object> templateModel) {
        try {
            Context thymeleafContext = new Context();
            thymeleafContext.setVariables(templateModel);
            
            String htmlBody = templateEngine.process("doctor-welcome", thymeleafContext);

            String rawDoctorName = String.valueOf(templateModel.getOrDefault("doctorName", "")).trim();
            String doctorName = rawDoctorName.startsWith("Dr.") ? rawDoctorName : ("Dr. " + rawDoctorName);
            String hospitalName = String.valueOf(templateModel.getOrDefault("hospitalName", "Swarnika Hospitals"));
            String departmentName = String.valueOf(templateModel.getOrDefault("departmentName", "Clinical Department"));
            String designation = String.valueOf(templateModel.getOrDefault("designation", "Consultant"));
            String loginEmail = String.valueOf(templateModel.getOrDefault("loginEmail", toEmail));
            String engagementType = String.valueOf(templateModel.getOrDefault("engagementType", "In-House Clinical"));
            String portalUrl = String.valueOf(templateModel.getOrDefault("portalUrl", "http://localhost:3001/login"));
            String year = String.valueOf(templateModel.getOrDefault("year", "2026"));

            String plainText = "Welcome to Swarnika Care\n\n"
                    + "Dear Dr. " + doctorName + ",\n\n"
                    + "Your Swarnika Care doctor account has been successfully created and verified.\n\n"
                    + "Account Details\n"
                    + "Hospital: " + hospitalName + "\n"
                    + "Department: " + departmentName + "\n"
                    + "Designation: " + designation + "\n"
                    + "Login Email: " + loginEmail + "\n"
                    + "Engagement: " + engagementType + "\n\n"
                    + "Access Swarnika Care:\n"
                    + portalUrl + "\n\n"
                    + "Sign in using your registered email and OTP. No password is required.\n\n"
                    + "Security Notice:\n"
                    + "Swarnika Hospitals will never ask you to share your OTP or verification code. Please keep your authentication information confidential.\n\n"
                    + "For assistance with your account or access to Swarnika Care, please contact the Swarnika Hospitals support team.\n\n"
                    + "Regards,\n"
                    + "Swarnika Hospitals\n"
                    + "IT / Digital Health Team\n\n"
                    + "© " + year + " Swarnika Hospitals Pvt. Ltd. All rights reserved.\n"
                    + "Swarnika Care\n";

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Swarnika Care — Your Doctor Account Is Ready");
            helper.setFrom("swarnikahospitals@gmail.com", "Swarnika Hospitals");
            helper.setText(plainText, htmlBody);

            javaMailSender.send(message);
            log.info("✅ Doctor welcome email sent to {}", toEmail);
            
        } catch (Exception e) {
            log.error("❌ Failed to send doctor welcome email to {}", toEmail, e);
            throw new RuntimeException("Email dispatch failed: " + e.getMessage(), e);
        }
    }
}
