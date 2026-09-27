package com.swarnikacare.billing.repository;
import com.swarnikacare.billing.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Receipt> findByPaymentId(Long paymentId);
}
