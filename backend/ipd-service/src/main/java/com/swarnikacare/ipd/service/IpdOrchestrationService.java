package com.swarnikacare.ipd.service;
import com.swarnikacare.ipd.client.EncounterClient;
import com.swarnikacare.ipd.client.OrganizationClient;
import com.swarnikacare.ipd.client.BillingClient;
import com.swarnikacare.ipd.entity.BedTransfer;
import com.swarnikacare.ipd.repository.BedTransferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class IpdOrchestrationService {
    private final EncounterClient encounterClient;
    private final OrganizationClient orgClient;
    private final BedTransferRepository transferRepo;
    private final BillingClient billingClient;

    @Transactional
    public void assignBed(Long admissionId, Long toBedId, Long hospitalId) {
        // Mark new bed as OCCUPIED
        Map<String, String> payload = new HashMap<>(); payload.put("status", "OCCUPIED");
        orgClient.updateBedStatus(toBedId, payload);
        
        // Update admission status and bedId in encounter-service
        encounterClient.updateAdmissionStatus(admissionId, "ADMITTED", toBedId, "Bed assigned via IPD");
        
        // Create tracking record (Initial transfer from NULL bed to toBedId)
        BedTransfer transfer = new BedTransfer();
        transfer.setAdmissionId(admissionId);
        transfer.setToBedId(toBedId);
        transfer.setHospitalId(hospitalId);
        transfer.setTransferReason("Initial Assignment");
        transferRepo.save(transfer);
    }
    
    @Transactional
    public void transferBed(Long admissionId, Long fromBedId, Long toBedId, Long hospitalId) {
        // Release old bed
        Map<String, String> releasePayload = new HashMap<>(); releasePayload.put("status", "CLEANING");
        orgClient.updateBedStatus(fromBedId, releasePayload);
        
        // Occupy new bed
        Map<String, String> occupyPayload = new HashMap<>(); occupyPayload.put("status", "OCCUPIED");
        orgClient.updateBedStatus(toBedId, occupyPayload);
        
        // Update admission with new bed
        encounterClient.updateAdmissionStatus(admissionId, "ADMITTED", toBedId, "Transferred via IPD");
        
        // Tracking
        BedTransfer transfer = new BedTransfer();
        transfer.setAdmissionId(admissionId);
        transfer.setFromBedId(fromBedId);
        transfer.setToBedId(toBedId);
        transfer.setHospitalId(hospitalId);
        transfer.setTransferReason("Patient Transfer");
        transferRepo.save(transfer);
    }
    
    @Transactional
    public void triggerDischargeBilling(Long admissionId, Long hospitalId, Long patientId) {
        Map<String, Object> charge = new HashMap<>();
        charge.put("hospitalId", hospitalId);
        charge.put("patientId", patientId);
        charge.put("unitPrice", 5000.0); // Dummy discharge processing fee
        charge.put("category", "IPD_CHARGES");
        charge.put("description", "Discharge Processing Fee for Admission " + admissionId);
        charge.put("quantity", 1);
        billingClient.createCharge(charge);
    }
}