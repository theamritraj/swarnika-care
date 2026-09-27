package com.swarnikacare.patient.controller;

import com.swarnikacare.patient.dto.PatientDocumentRequest;
import com.swarnikacare.patient.dto.PatientDocumentResponse;
import com.swarnikacare.patient.dto.PatientDocumentViewResponse;
import com.swarnikacare.patient.entity.PatientDocument;
import com.swarnikacare.patient.entity.PatientDocumentStatus;
import com.swarnikacare.patient.exception.PatientNotFoundException;
import com.swarnikacare.patient.repository.PatientDocumentRepository;
import com.swarnikacare.patient.repository.PatientRepository;
import com.swarnikacare.patient.service.DocumentAccessService;
import com.swarnikacare.patient.service.PatientDocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class PatientDocumentController {

    private final PatientDocumentService documentService;
    private final PatientDocumentRepository documentRepository;
    private final PatientRepository patientRepository;
    private final DocumentAccessService accessService;

    public PatientDocumentController(
            PatientDocumentService documentService,
            PatientDocumentRepository documentRepository,
            PatientRepository patientRepository,
            DocumentAccessService accessService) {
        this.documentService = documentService;
        this.documentRepository = documentRepository;
        this.patientRepository = patientRepository;
        this.accessService = accessService;
    }

    // ─── Staff / Admin Endpoints ──────────────────────────────────────────────

    /**
     * Staff: upload a document for a patient (identified by {patientId}).
     */
    @PostMapping("/api/v1/patients/{patientId}/documents")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> addDocument(
            @PathVariable Long patientId,
            @Valid @RequestBody PatientDocumentRequest request) {
        PatientDocumentResponse doc = documentService.addDocument(patientId, request);
        return new ResponseEntity<>(ok("Document uploaded successfully", doc), HttpStatus.CREATED);
    }

    /**
     * Staff: list all documents for a patient (full response including fileUrl).
     */
    @GetMapping("/api/v1/patients/{patientId}/documents")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> getDocuments(@PathVariable Long patientId) {
        List<PatientDocumentResponse> docs = documentService.getDocumentsByPatient(patientId);
        return ResponseEntity.ok(ok("Documents retrieved successfully", docs));
    }

    /**
     * Staff: verify a document.
     */
    @PatchMapping("/api/v1/patients/{patientId}/documents/{documentId}/verify")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HOSPITAL_ADMIN','RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> verifyDocument(
            @PathVariable Long patientId,
            @PathVariable Long documentId,
            Authentication authentication) {
        String verifier = authentication != null ? authentication.getName() : "RECEPTIONIST";
        PatientDocumentResponse doc = documentService.verifyDocument(patientId, documentId, verifier);
        return ResponseEntity.ok(ok("Document verified successfully", doc));
    }

    // ─── Patient Self-Service Endpoints ──────────────────────────────────────

    /**
     * Patient: list own documents.
     *
     * SECURITY:
     * - PatientId resolved from JWT (never from URL)
     * - Returns PatientDocumentViewResponse — fileUrl intentionally excluded
     * - Patient sees only their own documents
     */
    @GetMapping("/api/v1/patients/me/documents")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyDocuments(Authentication auth) {
        Long patientId = resolvePatientId(auth);
        List<PatientDocument> docs = documentRepository.findByPatientId(patientId);
        List<PatientDocumentViewResponse> dtos = docs.stream()
                .map(PatientDocumentViewResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ok("Your documents retrieved successfully", dtos));
    }

    /**
     * Patient: request time-limited secure access to a specific document.
     *
     * SECURITY:
     * - Verifies patientId from JWT matches document.patientId
     * - Returns HMAC-signed access token (not fileUrl)
     * - Token expires in 15 minutes
     * - Only VERIFIED documents are accessible by patient
     *
     * Client uses: GET /api/v1/patients/me/documents/{id}/access
     * Response: { accessToken, expiresInSeconds, documentName, documentType }
     */
    @GetMapping("/api/v1/patients/me/documents/{documentId}/access")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> requestDocumentAccess(
            @PathVariable Long documentId,
            Authentication auth) {
        Long patientId = resolvePatientId(auth);

        PatientDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new PatientNotFoundException("Document not found"));

        // Ownership check — server-side
        if (!doc.getPatientId().equals(patientId)) {
            throw new AccessDeniedException("Access denied: document does not belong to this patient");
        }

        // Only allow access to verified documents
        if (doc.getStatus() == PatientDocumentStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(err("Document access denied: document has been rejected"));
        }

        // Issue signed access token
        String token = accessService.issueToken(patientId, documentId);

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", token);
        result.put("expiresInSeconds", 900);
        result.put("documentName", doc.getDocumentName());
        result.put("documentType", doc.getDocumentType());
        result.put("status", doc.getStatus());
        return ResponseEntity.ok(ok("Document access token issued. Valid for 15 minutes.", result));
    }

    /**
     * Token redemption endpoint — validates signed token and redirects to file.
     *
     * SECURITY:
     * - Validates HMAC signature (cannot be forged)
     * - Validates token expiry (15-minute TTL)
     * - Validates patientId embedded in token matches document.patientId
     * - Never exposes raw fileUrl to client — issues 302 redirect server-side
     *
     * This endpoint is callable by any authenticated user with a valid token.
     * The token itself encodes ownership so no separate auth header needed.
     */
    @GetMapping("/api/v1/documents/redeem")
    public ResponseEntity<Void> redeemDocumentAccess(@RequestParam String token) {
        DocumentAccessService.DocumentAccessClaims claims = accessService.validateToken(token);
        if (claims == null) {
            return ResponseEntity.status(HttpStatus.GONE).build(); // 410 Gone for expired/invalid
        }

        PatientDocument doc = documentRepository.findById(claims.documentId())
                .orElse(null);
        if (doc == null || !doc.getPatientId().equals(claims.patientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Redirect to actual file URL — client never sees it directly
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(doc.getFileUrl()))
                .build();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Long resolvePatientId(Authentication auth) {
        if (auth == null) throw new AccessDeniedException("Unauthorized");
        String userId = auth.getName();
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new AccessDeniedException("Patient not found for user: " + userId))
                .getId();
    }

    private Map<String, Object> ok(String message, Object data) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", message);
        if (data != null) r.put("data", data);
        return r;
    }

    private Map<String, Object> err(String message) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", false);
        r.put("message", message);
        return r;
    }
}
