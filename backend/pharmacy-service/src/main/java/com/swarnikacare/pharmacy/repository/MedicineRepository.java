package com.swarnikacare.pharmacy.repository;
import com.swarnikacare.pharmacy.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByHospitalId(Long hospitalId);
}