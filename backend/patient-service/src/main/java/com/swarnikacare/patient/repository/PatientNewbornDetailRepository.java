package com.swarnikacare.patient.repository;

import com.swarnikacare.patient.entity.PatientNewbornDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientNewbornDetailRepository extends JpaRepository<PatientNewbornDetail, Long> {
    Optional<PatientNewbornDetail> findByPatientId(Long patientId);
}
