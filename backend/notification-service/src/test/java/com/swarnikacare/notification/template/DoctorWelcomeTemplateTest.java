package com.swarnikacare.notification.template;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DoctorWelcomeTemplateTest {

    private SpringTemplateEngine templateEngine;

    @BeforeEach
    void setUp() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(resolver);
    }

    @Test
    @DisplayName("Doctor Welcome Email renders required hospital enterprise copy and variables correctly")
    void testDoctorWelcomeEmailRendering() {
        Map<String, Object> model = new HashMap<>();
        model.put("doctorName", "Dr. Amrit Raj");
        model.put("hospitalName", "Swarnika Hospitals Main Branch");
        model.put("departmentName", "Cardiology");
        model.put("designation", "Senior Consultant");
        model.put("loginEmail", "amrit.raj@swarnika.com");
        model.put("engagementType", "Public Appointments + In-House Clinical");
        model.put("portalUrl", "https://care.swarnikahospitals.com/login");
        model.put("year", "2026");

        Context context = new Context();
        context.setVariables(model);

        String renderedHtml = templateEngine.process("doctor-welcome", context);

        assertNotNull(renderedHtml);

        // Header and Title
        assertTrue(renderedHtml.contains("SWARNIKA"), "Must contain SWARNIKA branding");
        assertTrue(renderedHtml.contains("HOSPITALS"), "Must contain HOSPITALS branding");
        assertTrue(renderedHtml.contains("Welcome to Swarnika Care"), "Must have correct title");

        // Greeting
        assertTrue(renderedHtml.contains("Dear Dr."), "Must contain doctor salutation");
        assertTrue(renderedHtml.contains("Dr. Amrit Raj"), "Must contain doctor name");
        assertTrue(renderedHtml.contains("Your Swarnika Care doctor account has been successfully created and verified."), "Must contain intro verification copy");
        assertTrue(renderedHtml.contains("You can now sign in using your registered email address and a one-time password (OTP)."), "Must contain OTP sign in instruction");

        // Account Details Table
        assertTrue(renderedHtml.contains("Account Details"), "Must contain Account Details header");
        assertTrue(renderedHtml.contains("Swarnika Hospitals Main Branch"), "Must contain hospital name");
        assertTrue(renderedHtml.contains("Cardiology"), "Must contain department name");
        assertTrue(renderedHtml.contains("Senior Consultant"), "Must contain designation");
        assertTrue(renderedHtml.contains("amrit.raj@swarnika.com"), "Must contain login email");
        assertTrue(renderedHtml.contains("Public Appointments + In-House Clinical"), "Must contain engagement");

        // Access and CTA
        assertTrue(renderedHtml.contains("Access Swarnika Care"), "Must contain Access heading and CTA");
        assertTrue(renderedHtml.contains("Sign in using your registered email address and OTP. No password is required."), "Must contain access copy");
        assertTrue(renderedHtml.contains("https://care.swarnikahospitals.com/login"), "Must contain portal URL");

        // Security Notice
        assertTrue(renderedHtml.contains("Security Notice"), "Must contain Security Notice heading");
        assertTrue(renderedHtml.contains("Swarnika Hospitals will never ask you to share your OTP or verification code."), "Must contain security notice text");

        // Support
        assertTrue(renderedHtml.contains("For assistance with your account or access to Swarnika Care, please contact the Swarnika Hospitals support team."), "Must contain official support copy");

        // Sign-off & Footer
        assertTrue(renderedHtml.contains("Regards,"), "Must contain sign-off");
        assertTrue(renderedHtml.contains("Swarnika Hospitals"), "Must contain hospital name in sign-off");
        assertTrue(renderedHtml.contains("IT / Digital Health Team"), "Must contain team in sign-off");
        assertTrue(renderedHtml.contains("Swarnika Hospitals Pvt. Ltd. All rights reserved."), "Must contain copyright");
        assertTrue(renderedHtml.contains("2026"), "Must contain year");

        // Prohibited startup / marketing phrases
        assertFalse(renderedHtml.contains("Doctor Account Ready"), "Must NOT contain startup banner heading");
        assertFalse(renderedHtml.contains("SWARNIKA HOSPITALS CLINICAL NETWORK"), "Must NOT contain marketing network banner");
        assertFalse(renderedHtml.contains("You are now authorized to practice across our connected clinical systems."), "Must NOT contain startup marketing copy");
        assertFalse(renderedHtml.contains("Ready to Access the Doctor Portal?"), "Must NOT contain marketing CTA container copy");
        assertFalse(renderedHtml.contains("Authoritative Enterprise Healthcare Information Platform"), "Must NOT contain unauthorized corporate tagline");
        assertFalse(renderedHtml.contains("linear-gradient"), "Must NOT contain gradient banner");
    }

    @Test
    @DisplayName("Doctor Welcome Email renders gracefully with default year when year is omitted")
    void testDoctorWelcomeEmailDefaultYear() {
        Map<String, Object> model = new HashMap<>();
        model.put("doctorName", "Priya Sharma");
        model.put("hospitalName", "Swarnika Bloom – Sasaram");
        model.put("departmentName", "Obstetrics & Gynaecology");
        model.put("designation", "Consultant");
        model.put("loginEmail", "dr.priya@swarnika.com");
        model.put("engagementType", "In-House Clinical");
        model.put("portalUrl", "http://localhost:3001/login");

        Context context = new Context();
        context.setVariables(model);

        String renderedHtml = templateEngine.process("doctor-welcome", context);
        assertNotNull(renderedHtml);
        assertTrue(renderedHtml.contains("2026"), "Must fallback to default year");
        assertTrue(renderedHtml.contains("Priya Sharma"));
        assertTrue(renderedHtml.contains("Swarnika Bloom – Sasaram"));
    }

    @Test
    @DisplayName("Render sample email with real-world doctor data and output to file")
    void generateSampleRenderedEmail() throws Exception {
        Map<String, Object> model = new HashMap<>();
        model.put("doctorName", "Dr. Amrit Raj");
        model.put("hospitalName", "Swarnika Hospitals");
        model.put("departmentName", "Dept A");
        model.put("designation", "Consultant");
        model.put("loginEmail", "dr.amritraj@swarnikacare.com");
        model.put("engagementType", "Public Appointments + In-House Clinical");
        model.put("portalUrl", "http://localhost:3001/login");
        model.put("year", "2026");

        Context context = new Context();
        context.setVariables(model);

        String renderedHtml = templateEngine.process("doctor-welcome", context);
        assertNotNull(renderedHtml);

        java.nio.file.Path outputPath = java.nio.file.Paths.get("target/rendered-doctor-welcome.html");
        java.nio.file.Files.createDirectories(outputPath.getParent());
        java.nio.file.Files.writeString(outputPath, renderedHtml, java.nio.charset.StandardCharsets.UTF_8);

        System.out.println("RENDERED EMAIL SAVED TO: " + outputPath.toAbsolutePath());
    }
}
