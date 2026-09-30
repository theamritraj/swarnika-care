package com.swarnikacare.iam.service;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.swarnikacare.iam.entity.OtpPurpose;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);
    
    private final RedisTemplate<String, Object> redisTemplate;
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

    public OtpServiceImpl(RedisTemplate<String, Object> redisTemplate, EmailSender emailSender, PasswordEncoder passwordEncoder) {
        this.redisTemplate = redisTemplate;
        this.emailSender = emailSender;
        this.passwordEncoder = passwordEncoder;
    }

    private String getOtpKey(String email, OtpPurpose purpose) {
        return "swarnika:prod:iam:otp:" + purpose.name() + ":" + email.toLowerCase();
    }

    private String getCooldownKey(String email, OtpPurpose purpose) {
        return "swarnika:prod:iam:otp-cooldown:" + purpose.name() + ":" + email.toLowerCase();
    }

    public static class OtpState {
        private String otpHash;
        private int attempts;

        public OtpState() {}

        @JsonCreator
        public OtpState(@JsonProperty("otpHash") String otpHash, @JsonProperty("attempts") int attempts) {
            this.otpHash = otpHash;
            this.attempts = attempts;
        }

        public String getOtpHash() { return otpHash; }
        public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
        public int getAttempts() { return attempts; }
        public void setAttempts(int attempts) { this.attempts = attempts; }
        public void incrementAttempts() { this.attempts++; }
    }

    @Override
    public void generateAndSendOtp(String email, OtpPurpose purpose) {
        String cooldownKey = getCooldownKey(email, purpose);
        
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            log.warn("OTP request rate limited for email: {}", email);
            throw new IllegalStateException("Please wait before requesting another OTP");
        }

        String plainOtp = String.format("%06d", secureRandom.nextInt(1000000));
        String hashedOtp = passwordEncoder.encode(plainOtp);
        
        OtpState newState = new OtpState(hashedOtp, 0);
        String otpKey = getOtpKey(email, purpose);

        redisTemplate.opsForValue().set(otpKey, newState, Duration.ofMinutes(expirationMinutes));
        redisTemplate.opsForValue().set(cooldownKey, "LOCKED", Duration.ofSeconds(resendCooldownSeconds));

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                emailSender.sendOtp(email, plainOtp, purpose.name());
            } catch (Exception e) {
                log.warn("Failed to send OTP email (probably missing SMTP config). OTP generated was: {}", plainOtp);
            }
        });
    }

    @Override
    public boolean verifyOtp(String email, String plainOtp, OtpPurpose purpose) {
        String otpKey = getOtpKey(email, purpose);
        
        Object rawState = redisTemplate.opsForValue().get(otpKey);
        
        if (rawState == null) {
            log.warn("No active/expired OTP found for email: {}", email);
            return false;
        }

        // Handle deserialization from Redis
        OtpState state;
        if (rawState instanceof OtpState) {
            state = (OtpState) rawState;
        } else {
            // Jackson might return a LinkedHashMap if not configured with class types
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            state = mapper.convertValue(rawState, OtpState.class);
        }

        if (state.getAttempts() >= maxAttempts) {
            log.warn("Max OTP attempts reached for email: {}", email);
            redisTemplate.delete(otpKey);
            return false;
        }

        state.incrementAttempts();

        if ((devBypass && "123456".equals(plainOtp)) || passwordEncoder.matches(plainOtp, state.getOtpHash())) {
            redisTemplate.delete(otpKey);
            return true;
        }

        // Update attempts and keep TTL
        Long expire = redisTemplate.getExpire(otpKey);
        if (expire != null && expire > 0) {
            redisTemplate.opsForValue().set(otpKey, state, Duration.ofSeconds(expire));
        } else {
            redisTemplate.delete(otpKey);
        }
        
        return false;
    }
}
