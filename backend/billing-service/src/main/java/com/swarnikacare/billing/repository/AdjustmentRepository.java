package com.swarnikacare.billing.repository;

import com.swarnikacare.billing.entity.Adjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdjustmentRepository extends JpaRepository<Adjustment, Long> {
    List<Adjustment> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Adjustment> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);
    List<Adjustment> findByInvoiceIdOrderByCreatedAtDesc(Long invoiceId);
}
