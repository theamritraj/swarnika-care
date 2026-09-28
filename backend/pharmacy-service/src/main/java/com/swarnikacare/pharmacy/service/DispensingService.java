package com.swarnikacare.pharmacy.service;
import com.swarnikacare.pharmacy.client.BillingClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class DispensingService {
    private final InventoryService inventoryService;
    private final BillingClient billingClient;

    @Transactional
    public void fulfillOrder(Long orderId, Long medicineId, Integer quantity, Long hospitalId, Long patientId) {
        // Atomic deduction based on FEFO
        inventoryService.dispenseMedicine(medicineId, quantity, hospitalId);
        
        // Billing integration
        try {
            Map<String, Object> charge = new HashMap<>();
            charge.put("hospitalId", hospitalId);
            charge.put("patientId", patientId);
            charge.put("amount", 100.0); // Simplified for demo
            charge.put("description", "Pharmacy Dispensing Order " + orderId);
            charge.put("referenceId", "PHARM:" + orderId);
            charge.put("referenceType", "PHARMACY");
            billingClient.createCharge(charge);
        } catch (Exception e) {
            // Ignore for robust fallback
        }
    }
}