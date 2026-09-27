package com.swarnikacare.patient.repository;

import com.swarnikacare.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(String userId);
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByMrn(String mrn);
    boolean existsByMrn(String mrn);
    boolean existsByEmail(String email);
}
