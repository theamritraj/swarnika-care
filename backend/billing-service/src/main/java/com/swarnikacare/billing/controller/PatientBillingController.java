package com.swarnikacare.billing.controller;

import com.swarnikacare.billing.dto.InvoiceResponse;
import com.swarnikacare.billing.dto.PaymentResponse;
import com.swarnikacare.billing.dto.ReceiptResponse;
import com.swarnikacare.billing.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Patient-facing Billing API.
 *
 * All endpoints:
 * - Require PATIENT role
 * - Resolve patientId from JWT (X-User-Id → patient lookup via PatientClient)
 * - Never accept patientId from URL, body, or query parameter
 * - Return only patient-facing DTOs (no internal fields)
 *
 * Patient permissions:
 * ✅ View own invoices
 * ✅ View own invoice details
 * ✅ View own payment history
 * ✅ View own receipts
 * ✅ View billing dashboard summary
 * ❌ Modify invoice (forbidden)
 * ❌ Delete invoice (forbidden)
 * ❌ Change payment amount (forbidden)
 * ❌ Waive charge (forbidden)
 * ❌ Refund (forbidden — staff only)
 */
@RestController
@RequestMapping("/api/v1/billing/me")
@PreAuthorize("hasRole('PATIENT')")
public class PatientBillingController {

    private final BillingService billingService;
    private final com.swarnikacare.billing.client.PatientClient patientClient;

    public PatientBillingController(BillingService billingService,
                                     com.swarnikacare.billing.client.PatientClient patientClient) {
        this.billingService = billingService;
        this.patientClient = patientClient;
    }

    /**
     * Billing dashboard summary.
     * Returns: outstanding amount, total invoices, paid/pending counts.
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getMySummary(Authentication auth) {
        Long patientId = resolvePatientId(auth);
        BillingService.BillingSummary summary = billingService.getMySummary(patientId);
        return ResponseEntity.ok(ok("Billing summary retrieved", summary));
    }

    /**
     * List all patient invoices, ordered by newest first.
     */
    @GetMapping("/invoices")
    public ResponseEntity<Map<String, Object>> getMyInvoices(Authentication auth) {
        Long patientId = resolvePatientId(auth);
        List<InvoiceResponse> invoices = billingService.getMyInvoices(patientId);
        return ResponseEntity.ok(ok("Invoices retrieved successfully", invoices));
    }

    /**
     * Get a single invoice by ID.
     * Server-side ownership check enforced: patient can only access own invoices.
     */
    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<Map<String, Object>> getMyInvoiceById(
            @PathVariable Long invoiceId, Authentication auth) {
        Long patientId = resolvePatientId(auth);
        InvoiceResponse invoice = billingService.getMyInvoiceById(patientId, invoiceId);
        return ResponseEntity.ok(ok("Invoice retrieved successfully", invoice));
    }

    /**
     * Payment history.
     */
    @GetMapping("/payments")
    public ResponseEntity<Map<String, Object>> getMyPayments(Authentication auth) {
        Long patientId = resolvePatientId(auth);
        List<PaymentResponse> payments = billingService.getMyPayments(patientId);
        return ResponseEntity.ok(ok("Payment history retrieved successfully", payments));
    }

    /**
     * Receipts for paid invoices.
     */
    @GetMapping("/receipts")
    public ResponseEntity<Map<String, Object>> getMyReceipts(Authentication auth) {
        Long patientId = resolvePatientId(auth);
        List<ReceiptResponse> receipts = billingService.getMyReceipts(patientId);
        return ResponseEntity.ok(ok("Receipts retrieved successfully", receipts));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Long resolvePatientId(Authentication auth) {
        if (auth == null) throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        try {
            Map<String, Object> resp = patientClient.getPatientMe(auth.getName());
            Object data = resp.get("data");
            if (data instanceof Map) {
                Object id = ((Map<String, Object>) data).get("id");
                if (id instanceof Number) return ((Number) id).longValue();
            }
        } catch (Exception e) {
            throw new org.springframework.security.access.AccessDeniedException("Could not resolve patient identity");
        }
        throw new org.springframework.security.access.AccessDeniedException("Patient identity resolution failed");
    }

    private Map<String, Object> ok(String message, Object data) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", message);
        if (data != null) r.put("data", data);
        return r;
    }
}
