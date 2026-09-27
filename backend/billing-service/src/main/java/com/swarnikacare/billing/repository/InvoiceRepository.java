package com.swarnikacare.billing.repository;
import com.swarnikacare.billing.entity.Invoice;
import com.swarnikacare.billing.entity.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Invoice> findByPatientIdAndHospitalIdOrderByCreatedAtDesc(Long patientId, Long hospitalId);
    List<Invoice> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, InvoiceStatus status);
}
