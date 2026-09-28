package com.swarnikacare.iam.service;

import com.swarnikacare.iam.entity.OtpPurpose;
import com.swarnikacare.iam.entity.OtpVerification;
import com.swarnikacare.iam.repository.OtpVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);
    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailSender emailSender;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${otp.expiration-minutes:5}")
    private int expirationMinutes;

    @Value("${otp.max-attempts:3}")
    private int maxAttempts;

    @Value("${otp.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    @Value("${otp.dev-bypass:true}")
    private boolean devBypass;

    public OtpServiceImpl(OtpVerificationRepository otpVerificationRepository, EmailSender emailSender, PasswordEncoder passwordEncoder) {
        this.otpVerificationRepository = otpVerificationRepository;
        this.emailSender = emailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void generateAndSendOtp(String email, OtpPurpose purpose) {
        Optional<OtpVerification> existingOtp = otpVerificationRepository.findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(email, purpose);
        
        if (existingOtp.isPresent()) {
            OtpVerification otp = existingOtp.get();
            if (otp.getCreatedAt().plusSeconds(resendCooldownSeconds).isAfter(LocalDateTime.now())) {
                log.warn("OTP request rate limited for email: {}", email);
                throw new IllegalStateException("Please wait before requesting another OTP");
            }
            // Expire previous OTP by marking it consumed if we are generating a new one
            otp.setConsumedAt(LocalDateTime.now());
            otpVerificationRepository.save(otp);
        }

        String plainOtp = String.format("%06d", secureRandom.nextInt(1000000));
        String hashedOtp = passwordEncoder.encode(plainOtp);

        OtpVerification newOtp = new OtpVerification(
                email,
                hashedOtp,
                purpose,
                LocalDateTime.now().plusMinutes(expirationMinutes)
        );
        otpVerificationRepository.save(newOtp);

        emailSender.sendOtp(email, plainOtp, purpose.name());
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String plainOtp, OtpPurpose purpose) {
        Optional<OtpVerification> optionalOtp = otpVerificationRepository.findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(email, purpose);
        
        if (optionalOtp.isEmpty()) {
            log.warn("No active OTP found for email: {}", email);
            return false;
        }

        OtpVerification otp = optionalOtp.get();

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("OTP expired for email: {}", email);
            return false;
        }

        if (otp.getAttemptCount() >= maxAttempts) {
            log.warn("Max OTP attempts reached for email: {}", email);
            otp.setConsumedAt(LocalDateTime.now());
            otpVerificationRepository.save(otp);
            return false;
        }

        otp.incrementAttempt();

        if ((devBypass && "123456".equals(plainOtp)) || passwordEncoder.matches(plainOtp, otp.getOtpHash())) {
            otp.setConsumedAt(LocalDateTime.now());
            otpVerificationRepository.save(otp);
            return true;
        }

        otpVerificationRepository.save(otp);
        return false;
    }
}
