package com.swarnikacare.billing.controller;

import com.swarnikacare.billing.dto.*;
import com.swarnikacare.billing.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing/staff")
@PreAuthorize("hasAnyRole('BILLING_STAFF', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST')")
public class StaffBillingController {

    private final BillingService billingService;

    public StaffBillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/charges")
    public ResponseEntity<Map<String, Object>> createCharge(@Valid @RequestBody CreateChargeRequest req, Authentication auth) {
        ChargeResponse res = billingService.createCharge(req, auth.getName());
        return ResponseEntity.ok(ok("Charge created successfully", res));
    }

    @GetMapping("/patients/{patientId}/charges")
    public ResponseEntity<Map<String, Object>> getChargesByPatient(@PathVariable Long patientId) {
        List<ChargeResponse> res = billingService.getChargesByPatient(patientId);
        return ResponseEntity.ok(ok("Charges retrieved successfully", res));
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('BILLING_STAFF', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createInvoice(@Valid @RequestBody CreateInvoiceRequest req, Authentication auth) {
        InvoiceResponse res = billingService.createInvoice(req, auth.getName());
        return ResponseEntity.ok(ok("Invoice created successfully", res));
    }

    @GetMapping("/hospitals/{hospitalId}/invoices")
    public ResponseEntity<Map<String, Object>> getInvoicesByHospital(@PathVariable Long hospitalId) {
        List<InvoiceResponse> res = billingService.getInvoicesByHospital(hospitalId);
        return ResponseEntity.ok(ok("Invoices retrieved successfully", res));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('BILLING_STAFF', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> recordPayment(@Valid @RequestBody RecordPaymentRequest req, Authentication auth) {
        PaymentResponse res = billingService.recordPayment(req, auth.getName());
        return ResponseEntity.ok(ok("Payment recorded successfully", res));
    }

    @PostMapping("/refunds")
    @PreAuthorize("hasAnyRole('BILLING_STAFF', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> processRefund(@Valid @RequestBody RefundRequest req, Authentication auth) {
        RefundResponse res = billingService.processRefund(req, auth.getName());
        return ResponseEntity.ok(ok("Refund processed successfully", res));
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasAnyRole('BILLING_STAFF', 'HOSPITAL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createAdjustment(@Valid @RequestBody AdjustmentRequest req, Authentication auth) {
        AdjustmentResponse res = billingService.createAdjustment(req, auth.getName());
        return ResponseEntity.ok(ok("Adjustment processed successfully", res));
    }

    private Map<String, Object> ok(String message, Object data) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", true);
        r.put("message", message);
        if (data != null) r.put("data", data);
        return r;
    }
}
