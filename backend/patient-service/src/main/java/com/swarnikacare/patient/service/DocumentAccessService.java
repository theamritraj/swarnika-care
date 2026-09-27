package com.swarnikacare.patient.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Generates and validates HMAC-SHA256 signed time-limited document access tokens.
 *
 * Token format (URL-safe Base64):
 *   {patientId}:{documentId}:{expiryEpochSeconds}:{hmac}
 *
 * Security properties:
 * - Token is HMAC-signed with server-side secret — cannot be forged
 * - Token encodes patientId — ownership is embedded and verified on redemption
 * - Token has TTL (default 15 minutes) — expired tokens are rejected
 * - Token is opaque to frontend — fileUrl is never returned to client
 * - Provider-specific storage URL is isolated in this service
 */
@Service
public class DocumentAccessService {

    private static final Logger log = LoggerFactory.getLogger(DocumentAccessService.class);
    private static final long DEFAULT_TTL_SECONDS = 15 * 60; // 15 minutes
    private static final String ALGO = "HmacSHA256";

    @Value("${app.document.access.secret:sw4rn1k4-d0c-s3cr3t-2026-x!}")
    private String signingSecret;

    @Value("${app.document.access.ttl-seconds:" + DEFAULT_TTL_SECONDS + "}")
    private long ttlSeconds;

    /**
     * Issue a signed access token for a specific patient+document.
     */
    public String issueToken(Long patientId, Long documentId) {
        long expiry = (System.currentTimeMillis() / 1000L) + ttlSeconds;
        String payload = patientId + ":" + documentId + ":" + expiry;
        String hmac = hmacSha256(payload, signingSecret);
        String raw = payload + ":" + hmac;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Validate token and return parsed claims, or null if invalid/expired.
     */
    public DocumentAccessClaims validateToken(String token) {
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(token);
            String raw = new String(decoded, StandardCharsets.UTF_8);
            String[] parts = raw.split(":");
            if (parts.length != 4) return null;

            long patientId = Long.parseLong(parts[0]);
            long documentId = Long.parseLong(parts[1]);
            long expiry = Long.parseLong(parts[2]);
            String providedHmac = parts[3];

            // Check expiry
            long now = System.currentTimeMillis() / 1000L;
            if (now > expiry) {
                log.warn("Document access token expired for patient={} doc={}", patientId, documentId);
                return null;
            }

            // Verify HMAC
            String payload = parts[0] + ":" + parts[1] + ":" + parts[2];
            String expectedHmac = hmacSha256(payload, signingSecret);
            if (!safeEquals(expectedHmac, providedHmac)) {
                log.warn("Document access token HMAC invalid for patient={} doc={}", patientId, documentId);
                return null;
            }

            return new DocumentAccessClaims(patientId, documentId, expiry);
        } catch (Exception e) {
            log.error("Document access token validation error: {}", e.getMessage());
            return null;
        }
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(ALGO);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), ALGO));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException("HMAC generation failed", e);
        }
    }

    /** Constant-time equality to prevent timing attacks */
    private boolean safeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int diff = 0;
        for (int i = 0; i < a.length(); i++) {
            diff |= a.charAt(i) ^ b.charAt(i);
        }
        return diff == 0;
    }

    /** Parsed claims from a valid access token */
    public record DocumentAccessClaims(long patientId, long documentId, long expiryEpoch) {}
}
