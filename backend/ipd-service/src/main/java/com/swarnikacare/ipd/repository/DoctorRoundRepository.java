package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.DoctorRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorRoundRepository extends JpaRepository<DoctorRound, Long> {
    List<DoctorRound> findByAdmissionId(Long admissionId);
}