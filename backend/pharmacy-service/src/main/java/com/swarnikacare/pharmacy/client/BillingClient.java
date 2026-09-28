package com.swarnikacare.pharmacy.client;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "billing-service", path = "/api/v1/billing/charges")
public interface BillingClient {
    @PostMapping
    Map<String, Object> createCharge(@RequestBody Map<String, Object> request);
}