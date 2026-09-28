import os

base_dir = "../backend/lab-service/src/main/java/com/swarnikacare/lab"

def write_file(path, content):
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content.strip())

write_file("client/BillingClient.java", """
package com.swarnikacare.lab.client;
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

write_file("service/NotificationPublisher.java", """
package com.swarnikacare.lab.service;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class NotificationPublisher {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    public void publishResultReleased(Long patientId, Long resultId, Long hospitalId) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", "LAB_RESULT_" + resultId);
        event.put("eventType", "LAB_RESULT_RELEASED");
        event.put("patientId", patientId);
        event.put("hospitalId", hospitalId);
        event.put("message", "A new laboratory result is available in Swarnika Care. Please log in to view your report.");
        
        kafkaTemplate.send("notification-events", "LAB_RESULT_" + resultId, event);
    }
}
""")

write_file("service/ResultService.java", """
package com.swarnikacare.lab.service;
import com.swarnikacare.lab.dto.LabResultRequest;
import com.swarnikacare.lab.entity.LabResult;
import com.swarnikacare.lab.repository.LabResultRepository;
import com.swarnikacare.lab.exception.ResourceNotFoundException;
import com.swarnikacare.lab.client.BillingClient;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResultService {
    private final LabResultRepository repository;
    private final BillingClient billingClient;
    private final NotificationPublisher notificationPublisher;

    public LabResult enterResult(LabResultRequest req, Long userId) {
        LabResult res = new LabResult();
        res.setLabOrderItemId(req.getLabOrderItemId());
        res.setSpecimenId(req.getSpecimenId());
        res.setPatientId(req.getPatientId());
        res.setHospitalId(req.getHospitalId());
        res.setResultType(req.getResultType());
        res.setNumericValue(req.getNumericValue());
        res.setTextValue(req.getTextValue());
        res.setUnit(req.getUnit());
        res.setReferenceRange(req.getReferenceRange());
        res.setAbnormalFlag(req.getAbnormalFlag());
        res.setStatus("RESULT_ENTERED");
        res.setEnteredBy(userId);
        return repository.save(res);
    }

    public LabResult verify(Long id, Long hospitalId, Long verifierId) {
        LabResult res = repository.findByIdAndHospitalId(id, hospitalId).orElseThrow(() -> new ResourceNotFoundException("Result not found"));
        res.setStatus("VERIFIED");
        res.setVerifiedBy(verifierId);
        res.setVerifiedAt(LocalDateTime.now());
        return repository.save(res);
    }

    public LabResult release(Long id, Long hospitalId) {
        LabResult res = repository.findByIdAndHospitalId(id, hospitalId).orElseThrow(() -> new ResourceNotFoundException("Result not found"));
        if (!"VERIFIED".equals(res.getStatus())) throw new IllegalStateException("Not verified");
        res.setStatus("RELEASED");
        res.setReleasedAt(LocalDateTime.now());
        LabResult saved = repository.save(res);
        
        // Billing Integration
        try {
            Map<String, Object> charge = new HashMap<>();
            charge.put("hospitalId", hospitalId);
            charge.put("patientId", res.getPatientId());
            charge.put("amount", 50.0); // Simulated lookup
            charge.put("description", "Lab Result Processing");
            charge.put("referenceId", "LAB:" + id);
            charge.put("referenceType", "LAB_TEST");
            billingClient.createCharge(charge);
        } catch (Exception e) {
            // Ignore/Log failure, outbox pattern should ideally be used
        }

        // Notification Integration
        try {
            notificationPublisher.publishResultReleased(res.getPatientId(), id, hospitalId);
        } catch (Exception e) {
            // Ignore/Log failure
        }
        
        return saved;
    }
}
""")

print("Phase 2 Integration Logic generated.")
