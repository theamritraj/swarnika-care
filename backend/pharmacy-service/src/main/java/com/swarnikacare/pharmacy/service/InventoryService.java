package com.swarnikacare.pharmacy.service;
import com.swarnikacare.pharmacy.entity.MedicineBatch;
import com.swarnikacare.pharmacy.repository.MedicineBatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final MedicineBatchRepository batchRepo;

    @Transactional
    public void dispenseMedicine(Long medicineId, Integer quantityRequired, Long hospitalId) {
        if (quantityRequired <= 0) throw new IllegalArgumentException("Quantity must be positive");
        
        List<MedicineBatch> batches = batchRepo.findAvailableBatchesOrderByExpiry(medicineId, hospitalId, LocalDate.now());
        
        int remaining = quantityRequired;
        for (MedicineBatch batch : batches) {
            if (remaining == 0) break;
            
            int toDeduct = Math.min(batch.getAvailableQuantity(), remaining);
            batch.setAvailableQuantity(batch.getAvailableQuantity() - toDeduct);
            batchRepo.save(batch);
            
            remaining -= toDeduct;
        }
        
        if (remaining > 0) {
            throw new IllegalStateException("Insufficient stock for medicine ID " + medicineId);
        }
    }
}