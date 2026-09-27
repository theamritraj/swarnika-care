package com.swarnikacare.billing.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import java.util.Map;
@FeignClient(name = "patient-service", path = "/api/v1/patients")
public interface PatientClient {
    @GetMapping("/me")
    Map<String, Object> getPatientMe(@RequestHeader("X-User-Id") String userId);
}
