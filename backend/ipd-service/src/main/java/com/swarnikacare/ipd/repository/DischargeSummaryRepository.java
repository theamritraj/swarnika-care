package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.DischargeSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DischargeSummaryRepository extends JpaRepository<DischargeSummary, Long> {
    Optional<DischargeSummary> findByAdmissionId(Long admissionId);
}