package com.swarnikacare.pharmacy.controller;
import com.swarnikacare.pharmacy.service.DispensingService;
import com.swarnikacare.pharmacy.entity.Medicine;
import com.swarnikacare.pharmacy.repository.MedicineRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.data.redis.core.RedisTemplate;
import java.time.Duration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {
    private final DispensingService dispensingService;
    private final MedicineRepository medicineRepo;
    private final RedisTemplate<String, Object> redisTemplate;

    @PostMapping("/medicines")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER')")
    public Medicine addMedicine(@RequestBody Medicine medicine) {
        medicine.setActive(true);
        Medicine saved = medicineRepo.save(medicine);
        if (medicine.getHospitalId() != null) {
            String cacheKey = "swarnika:prod:pharmacy:medicines:hospital:" + medicine.getHospitalId();
            try {
                redisTemplate.delete(cacheKey);
            } catch (Exception e) {}
        }
        return saved;
    }
    
    @GetMapping("/medicines")
    public List<Medicine> getMedicines(@RequestParam Long hospitalId) {
        String cacheKey = "swarnika:prod:pharmacy:medicines:hospital:" + hospitalId;
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.convertValue(cached, new TypeReference<List<Medicine>>() {});
            }
        } catch (Exception e) {}
        
        List<Medicine> medicines = medicineRepo.findByHospitalId(hospitalId);
        
        try {
            redisTemplate.opsForValue().set(cacheKey, medicines, Duration.ofHours(1));
        } catch (Exception e) {}
        
        return medicines;
    }

    @PostMapping("/orders/{id}/dispense")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PHARMACIST')")
    public Map<String, String> dispense(@PathVariable Long id, @RequestBody Map<String, Object> req, @RequestParam Long hospitalId) {
        Long medicineId = Long.valueOf(req.get("medicineId").toString());
        Integer quantity = Integer.valueOf(req.get("quantity").toString());
        Long patientId = Long.valueOf(req.get("patientId").toString());
        
        dispensingService.fulfillOrder(id, medicineId, quantity, hospitalId, patientId);
        
        Map<String, String> res = new HashMap<>();
        res.put("status", "DISPENSED");
        return res;
    }
}