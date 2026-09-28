package com.swarnikacare.ipd.repository;
import com.swarnikacare.ipd.entity.BedTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BedTransferRepository extends JpaRepository<BedTransfer, Long> {
    List<BedTransfer> findByAdmissionId(Long admissionId);
}