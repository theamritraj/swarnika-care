package com.swarnikacare.pharmacy.repository;
import com.swarnikacare.pharmacy.entity.MedicineBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MedicineBatchRepository extends JpaRepository<MedicineBatch, Long> {
    @Query("SELECT b FROM MedicineBatch b WHERE b.medicineId = :medicineId AND b.hospitalId = :hospitalId AND b.status = 'ACTIVE' AND b.expiryDate > :today AND b.availableQuantity > 0 ORDER BY b.expiryDate ASC")
    List<MedicineBatch> findAvailableBatchesOrderByExpiry(@Param("medicineId") Long medicineId, @Param("hospitalId") Long hospitalId, @Param("today") LocalDate today);
    
    Optional<MedicineBatch> findByMedicineIdAndBatchNumberAndHospitalId(Long medicineId, String batchNumber, Long hospitalId);
}