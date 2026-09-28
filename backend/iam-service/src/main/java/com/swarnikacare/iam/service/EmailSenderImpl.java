package com.swarnikacare.iam.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSenderImpl implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(EmailSenderImpl.class);
    private final JavaMailSender mailSender;

    public EmailSenderImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendOtp(String to, String otp, String purpose) {
        log.info("📧 Sending {} verification code to {}", purpose, to);
        log.info("=============================================");
        log.info("🚀 YOUR LOCAL DEVELOPMENT OTP IS: {}", otp);
        log.info("=============================================");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        
        if ("DOCTOR_ONBOARDING".equalsIgnoreCase(purpose)) {
            message.setSubject("Verify your Swarnika Care doctor account");
            message.setText("Hello Doctor,\n\n" +
                    "Your verification code for Swarnika Care doctor account onboarding is:\n\n" +
                    "  " + otp + "\n\n" +
                    "This code expires in 5 minutes. Do not share this code with anyone.\n\n" +
                    "If you did not request this verification, please contact Swarnika Hospitals administration immediately.\n\n" +
                    "Regards,\nSwarnika Hospitals Administration");
        } else {
            message.setSubject("Your Swarnika Care OTP - " + purpose);
            message.setText("Hello,\n\nYour One Time Password (OTP) for Swarnika Care " + purpose + " is: " + otp + "\n\nThis OTP is valid for 5 minutes. Do not share it with anyone.\n\nThank you,\nSwarnika Hospitals");
        }
        
        try {
            mailSender.send(message);
            log.info("✅ Verification code email successfully sent to {}", to);
        } catch (Exception e) {
            log.error("❌ Failed to send verification code email to {}", to, e);
        }
    }
}
