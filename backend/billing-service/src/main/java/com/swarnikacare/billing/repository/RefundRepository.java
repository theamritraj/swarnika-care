package com.swarnikacare.billing.repository;

import com.swarnikacare.billing.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Refund> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);
    List<Refund> findByInvoiceIdOrderByCreatedAtDesc(Long invoiceId);
    List<Refund> findByPaymentIdOrderByCreatedAtDesc(Long paymentId);
}
