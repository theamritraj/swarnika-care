package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.IpdVital;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IpdVitalRepository extends JpaRepository<IpdVital, Long> {
    List<IpdVital> findByAdmissionId(Long admissionId);
}