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

@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
public class PharmacyController {
    private final DispensingService dispensingService;
    private final MedicineRepository medicineRepo;

    @PostMapping("/medicines")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'PHARMACY_MANAGER')")
    public Medicine addMedicine(@RequestBody Medicine medicine) {
        medicine.setActive(true);
        return medicineRepo.save(medicine);
    }
    
    @GetMapping("/medicines")
    public List<Medicine> getMedicines(@RequestParam Long hospitalId) {
        return medicineRepo.findByHospitalId(hospitalId);
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