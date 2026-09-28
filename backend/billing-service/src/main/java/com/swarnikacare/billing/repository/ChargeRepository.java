package com.swarnikacare.billing.repository;

import com.swarnikacare.billing.entity.Charge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargeRepository extends JpaRepository<Charge, Long> {
    List<Charge> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Charge> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);
    List<Charge> findByEncounterIdOrderByCreatedAtDesc(Long encounterId);
}
