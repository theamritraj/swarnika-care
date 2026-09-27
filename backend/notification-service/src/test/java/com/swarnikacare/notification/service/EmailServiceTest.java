package com.swarnikacare.notification.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

class EmailServiceTest {

    private FakeJavaMailSender mailSender;
    private SpringTemplateEngine templateEngine;
    private EmailService emailService;

    // Fake JavaMailSender to avoid ByteBuddy bytecode instrumentation issues on Java 27
    static class FakeJavaMailSender implements JavaMailSender {
        List<MimeMessage> sentMessages = new ArrayList<>();
        boolean throwOnSend = false;

        @Override
        public MimeMessage createMimeMessage() {
            return new MimeMessage(Session.getInstance(new Properties()));
        }

        @Override
        public MimeMessage createMimeMessage(InputStream contentStream) throws MailException {
            return createMimeMessage();
        }

        @Override
        public void send(MimeMessage mimeMessage) throws MailException {
            if (throwOnSend) {
                throw new MailException("SMTP Server Unreachable") {};
            }
            sentMessages.add(mimeMessage);
        }

        @Override
        public void send(MimeMessage... mimeMessages) throws MailException {
            for (MimeMessage msg : mimeMessages) {
                send(msg);
            }
        }

        @Override
        public void send(MimeMessagePreparator mimeMessagePreparator) throws MailException {}

        @Override
        public void send(MimeMessagePreparator... mimeMessagePreparators) throws MailException {}

        @Override
        public void send(SimpleMailMessage simpleMessage) throws MailException {}

        @Override
        public void send(SimpleMailMessage... simpleMessages) throws MailException {}
    }

    @BeforeEach
    void setUp() {
        mailSender = new FakeJavaMailSender();

        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(resolver);

        emailService = new EmailService(mailSender, templateEngine);
    }

    @Test
    @DisplayName("sendDoctorWelcomeEmail processes real template and dispatches email correctly")
    void testSendDoctorWelcomeEmail() throws Exception {
        Map<String, Object> model = new HashMap<>();
        model.put("doctorName", "Dr. Amrit Raj");
        model.put("hospitalName", "Swarnika Hospitals Main Branch");
        model.put("departmentName", "Cardiology");
        model.put("designation", "Consultant");
        model.put("loginEmail", "dr.amrit@swarnika.com");
        model.put("engagementType", "Public Appointments + In-House Clinical");
        model.put("portalUrl", "http://localhost:3001/login");
        model.put("year", "2026");

        emailService.sendDoctorWelcomeEmail("dr.amrit@swarnika.com", model);

        assertEquals(1, mailSender.sentMessages.size());
        MimeMessage sentMessage = mailSender.sentMessages.get(0);

        assertEquals("Welcome to Swarnika Care — Your Doctor Account Is Ready", sentMessage.getSubject());
        assertEquals("dr.amrit@swarnika.com", sentMessage.getAllRecipients()[0].toString());
        assertTrue(sentMessage.getFrom()[0].toString().contains("Swarnika Hospitals"));
    }

    @Test
    @DisplayName("sendDoctorWelcomeEmail throws exception when mail sender fails for failure isolation")
    void testSendDoctorWelcomeEmailFailureIsolation() {
        mailSender.throwOnSend = true;

        Map<String, Object> model = new HashMap<>();
        model.put("doctorName", "Dr. Test");
        model.put("hospitalName", "Swarnika Hospitals");
        model.put("departmentName", "Medicine");
        model.put("designation", "Consultant");
        model.put("loginEmail", "test@swarnika.com");
        model.put("engagementType", "In-House Clinical");
        model.put("portalUrl", "http://localhost:3001/login");

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> {
            emailService.sendDoctorWelcomeEmail("test@swarnika.com", model);
        });

        assertTrue(thrown.getMessage().contains("Email dispatch failed"));
    }
}
