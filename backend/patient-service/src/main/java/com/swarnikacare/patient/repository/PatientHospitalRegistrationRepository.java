package com.swarnikacare.patient.repository;

import com.swarnikacare.patient.entity.PatientHospitalRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientHospitalRegistrationRepository extends JpaRepository<PatientHospitalRegistration, Long> {
    List<PatientHospitalRegistration> findByPatientId(Long patientId);
    List<PatientHospitalRegistration> findByHospitalId(Long hospitalId);
    Optional<PatientHospitalRegistration> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
    Optional<PatientHospitalRegistration> findByRegistrationNumber(String registrationNumber);
    boolean existsByPatientIdAndHospitalId(Long patientId, Long hospitalId);
    boolean existsByRegistrationNumber(String registrationNumber);
}
