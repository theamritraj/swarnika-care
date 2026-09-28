import os

base_dir = "backend/ipd-service/src/main/java/com/swarnikacare/ipd"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip())

write_file("entity/BedTransfer.java", """
package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity @Table(name = "bed_transfers") @Data
public class BedTransfer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long admissionId;
    private Long hospitalId;
    private Long fromBedId;
    private Long toBedId;
    private String transferReason;
    private Long transferredBy;
    private LocalDateTime transferDate = LocalDateTime.now();
}
""")

write_file("entity/IpdVital.java", """
package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity @Table(name = "ipd_vitals") @Data
public class IpdVital {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long admissionId;
    private Long patientId;
    private Long hospitalId;
    private Long recordedBy;
    private BigDecimal temperature;
    private Integer heartRate;
    private String bloodPressure;
    private Integer respiratoryRate;
    private Integer oxygenSaturation;
    private String notes;
    private LocalDateTime recordedAt = LocalDateTime.now();
}
""")

write_file("entity/DoctorRound.java", """
package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity @Table(name = "doctor_rounds") @Data
public class DoctorRound {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private Long admissionId;
    private Long doctorId;
    private Long hospitalId;
    private LocalDateTime roundDate = LocalDateTime.now();
    private String clinicalNotes;
    private String diagnosisUpdate;
    private String plan;
}
""")

write_file("entity/DischargeSummary.java", """
package com.swarnikacare.ipd.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity @Table(name = "discharge_summaries") @Data
public class DischargeSummary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(unique = true) private Long admissionId;
    private Long patientId;
    private Long hospitalId;
    private Long dischargingDoctorId;
    private LocalDateTime dischargeDate = LocalDateTime.now();
    private String dischargeStatus;
    private String clinicalCourse;
    private String dischargeCondition;
    private String followUpInstructions;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
""")

write_file("repository/BedTransferRepository.java", """
package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.BedTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BedTransferRepository extends JpaRepository<BedTransfer, Long> {
    List<BedTransfer> findByAdmissionId(Long admissionId);
}
""")

write_file("repository/IpdVitalRepository.java", """
package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.IpdVital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IpdVitalRepository extends JpaRepository<IpdVital, Long> {
    List<IpdVital> findByAdmissionId(Long admissionId);
}
""")

write_file("repository/DoctorRoundRepository.java", """
package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.DoctorRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorRoundRepository extends JpaRepository<DoctorRound, Long> {
    List<DoctorRound> findByAdmissionId(Long admissionId);
}
""")

write_file("repository/DischargeSummaryRepository.java", """
package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.DischargeSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DischargeSummaryRepository extends JpaRepository<DischargeSummary, Long> {
    Optional<DischargeSummary> findByAdmissionId(Long admissionId);
}
""")

write_file("client/EncounterClient.java", """
package com.swarnikacare.ipd.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@FeignClient(name = "encounter-service", path = "/api/v1/admissions")
public interface EncounterClient {
    @PatchMapping("/{id}/status")
    Map<String, Object> updateAdmissionStatus(@PathVariable Long id, @RequestParam(required = false) String status, @RequestParam(required = false) Long bedId, @RequestParam(required = false) String notes);
    
    @GetMapping("/{id}")
    Map<String, Object> getAdmissionById(@PathVariable Long id);
}
""")

write_file("client/OrganizationClient.java", """
package com.swarnikacare.ipd.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@FeignClient(name = "organization-service", path = "/api/v1/beds")
public interface OrganizationClient {
    @PatchMapping("/{id}/status")
    Map<String, Object> updateBedStatus(@PathVariable Long id, @RequestBody Map<String, String> status);
    
    @GetMapping("/{id}")
    Map<String, Object> getBedById(@PathVariable Long id);
}
""")

write_file("client/BillingClient.java", """
package com.swarnikacare.ipd.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "billing-service", path = "/api/v1/billing/charges")
public interface BillingClient {
    @PostMapping
    Map<String, Object> createCharge(@RequestBody Map<String, Object> request);
}
""")

write_file("service/IpdOrchestrationService.java", """
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
        encounterClient.updateAdmissionStatus(admissionId, "ACTIVE", toBedId, "Bed assigned via IPD");
        
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
        Map<String, String> releasePayload = new HashMap<>(); releasePayload.put("status", "AVAILABLE");
        orgClient.updateBedStatus(fromBedId, releasePayload);
        
        // Occupy new bed
        Map<String, String> occupyPayload = new HashMap<>(); occupyPayload.put("status", "OCCUPIED");
        orgClient.updateBedStatus(toBedId, occupyPayload);
        
        // Update admission with new bed
        encounterClient.updateAdmissionStatus(admissionId, "TRANSFERRED", toBedId, "Transferred via IPD");
        
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
        charge.put("amount", 5000.0); // Dummy discharge processing fee
        charge.put("description", "Discharge Processing Fee for Admission " + admissionId);
        charge.put("referenceId", "DISCH:" + admissionId);
        charge.put("referenceType", "IPD");
        billingClient.createCharge(charge);
    }
}
""")

write_file("controller/IpdController.java", """
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
            Map<String, String> releasePayload = new HashMap<>(); releasePayload.put("status", "AVAILABLE");
            orgClient.updateBedStatus(bedId, releasePayload);
        }

        // 2. Trigger Billing
        orchestrationService.triggerDischargeBilling(summary.getAdmissionId(), hospitalId, summary.getPatientId());
        
        summary.setHospitalId(hospitalId);
        return dischargeRepo.save(summary);
    }
    
    @GetMapping("/admissions/{admissionId}/discharges")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    public DischargeSummary getDischarge(@PathVariable Long admissionId) {
        return dischargeRepo.findByAdmissionId(admissionId).orElseThrow(() -> new IllegalArgumentException("No discharge found"));
    }
}
""")

print("IPD Phase 2 generated.")
