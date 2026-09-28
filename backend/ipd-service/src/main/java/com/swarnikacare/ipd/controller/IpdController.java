package com.swarnikacare.ipd.controller;
import com.swarnikacare.ipd.entity.IpdVital;
import com.swarnikacare.ipd.entity.DoctorRound;
import com.swarnikacare.ipd.entity.DischargeSummary;
import com.swarnikacare.ipd.repository.IpdVitalRepository;
import com.swarnikacare.ipd.repository.DoctorRoundRepository;
import com.swarnikacare.ipd.repository.DischargeSummaryRepository;
import com.swarnikacare.ipd.service.IpdOrchestrationService;
import com.swarnikacare.ipd.client.EncounterClient;
import com.swarnikacare.ipd.client.OrganizationClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/ipd")
@RequiredArgsConstructor
public class IpdController {
    
    private final IpdOrchestrationService orchestrationService;
    private final IpdVitalRepository vitalRepo;
    private final DoctorRoundRepository roundRepo;
    private final DischargeSummaryRepository dischargeRepo;
    private final EncounterClient encounterClient;
    private final OrganizationClient orgClient;
    private final org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @PostMapping("/bed-assignments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'STAFF', 'NURSE')")
    public Map<String, String> assignBed(@RequestBody Map<String, Object> req, @RequestParam Long hospitalId) {
        Long admissionId = Long.valueOf(req.get("admissionId").toString());
        Long bedId = Long.valueOf(req.get("bedId").toString());
        orchestrationService.assignBed(admissionId, bedId, hospitalId);
        Map<String, String> res = new HashMap<>(); res.put("status", "ASSIGNED"); return res;
    }
    
    @PostMapping("/transfers")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'RECEPTIONIST', 'STAFF', 'NURSE')")
    public Map<String, String> transferBed(@RequestBody Map<String, Object> req, @RequestParam Long hospitalId) {
        Long admissionId = Long.valueOf(req.get("admissionId").toString());
        Long fromBedId = Long.valueOf(req.get("fromBedId").toString());
        Long toBedId = Long.valueOf(req.get("toBedId").toString());
        orchestrationService.transferBed(admissionId, fromBedId, toBedId, hospitalId);
        Map<String, String> res = new HashMap<>(); res.put("status", "TRANSFERRED"); return res;
    }

    @PostMapping("/vitals")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'NURSE', 'DOCTOR')")
    public IpdVital recordVitals(@RequestBody IpdVital vital) {
        return vitalRepo.save(vital);
    }
    
    @GetMapping("/admissions/{admissionId}/vitals")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'NURSE', 'DOCTOR', 'PATIENT')")
    public List<IpdVital> getVitals(@PathVariable Long admissionId) {
        return vitalRepo.findByAdmissionId(admissionId);
    }

    @PostMapping("/rounds")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR')")
    public DoctorRound recordRound(@RequestBody DoctorRound round) {
        return roundRepo.save(round);
    }
    
    @GetMapping("/admissions/{admissionId}/rounds")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    public List<DoctorRound> getRounds(@PathVariable Long admissionId) {
        return roundRepo.findByAdmissionId(admissionId);
    }

    @PostMapping("/discharges")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR')")
    @SuppressWarnings("unchecked")
    public DischargeSummary dischargePatient(@RequestBody DischargeSummary summary, @RequestParam Long hospitalId) {
        // Block duplicate discharges
        if (dischargeRepo.findByAdmissionId(summary.getAdmissionId()).isPresent()) {
            throw new IllegalStateException("Discharge summary already exists for this admission");
        }
        
        // 1. Mark Admission as DISCHARGED and release bed
        encounterClient.updateAdmissionStatus(summary.getAdmissionId(), "DISCHARGED", null, "Discharged via IPD");
        
        // (Note: To properly release the bed, we need the current bedId. A real impl would fetch the admission first. 
        // For brevity in phase 2, let's assume encounterClient manages null bedId to release. But we should explicitly release it if we can.)
        Map<String, Object> admissionRes = encounterClient.getAdmissionById(summary.getAdmissionId());
        Map<String, Object> admissionData = (Map<String, Object>) admissionRes.get("data");
        if (admissionData.get("bedId") != null) {
            Long bedId = Long.valueOf(admissionData.get("bedId").toString());
            Map<String, String> releasePayload = new HashMap<>(); releasePayload.put("status", "CLEANING");
            orgClient.updateBedStatus(bedId, releasePayload);
        }

        // 2. Trigger Billing
        orchestrationService.triggerDischargeBilling(summary.getAdmissionId(), hospitalId, summary.getPatientId());
        
        summary.setHospitalId(hospitalId);
        DischargeSummary saved = dischargeRepo.save(summary);
        
        com.swarnikacare.ipd.event.PatientDischargedEvent event = new com.swarnikacare.ipd.event.PatientDischargedEvent();
        event.setAdmissionId(saved.getAdmissionId());
        event.setPatientId(saved.getPatientId());
        event.setDischargeStatus(saved.getDischargeStatus());
        event.setDischargeCondition(saved.getDischargeCondition());
        event.setDischargedAt(saved.getDischargeDate());
        kafkaTemplate.send("swarnika.patient.discharged", event);
        
        return saved;
    }
    
    @GetMapping("/admissions/{admissionId}/discharges")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public DischargeSummary getDischarge(@PathVariable Long admissionId) {
        return dischargeRepo.findByAdmissionId(admissionId).orElseThrow(() -> new IllegalArgumentException("No discharge found"));
    }
}