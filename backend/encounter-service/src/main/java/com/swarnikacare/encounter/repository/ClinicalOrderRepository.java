package com.swarnikacare.encounter.repository;

import com.swarnikacare.encounter.entity.ClinicalOrder;
import com.swarnikacare.encounter.entity.ClinicalOrderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClinicalOrderRepository extends JpaRepository<ClinicalOrder, Long> {
    Optional<ClinicalOrder> findByOrderNumber(String orderNumber);
    List<ClinicalOrder> findByEncounterId(Long encounterId);
    List<ClinicalOrder> findByPatientId(Long patientId);
    List<ClinicalOrder> findByDoctorId(Long doctorId);
    List<ClinicalOrder> findByHospitalId(Long hospitalId);
    List<ClinicalOrder> findByEncounterIdAndOrderType(Long encounterId, ClinicalOrderType orderType);
}
