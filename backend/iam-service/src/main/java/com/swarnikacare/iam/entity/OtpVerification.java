package com.swarnikacare.iam.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "otp_verifications")
@Getter
@Setter
@NoArgsConstructor
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otpHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OtpPurpose purpose;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private int attemptCount = 0;

    private LocalDateTime consumedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public OtpVerification(String email, String otpHash, OtpPurpose purpose, LocalDateTime expiresAt) {
        this.email = email;
        this.otpHash = otpHash;
        this.purpose = purpose;
        this.expiresAt = expiresAt;
    }

    public void incrementAttempt() {
        this.attemptCount++;
    }
}
