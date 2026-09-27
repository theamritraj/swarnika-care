package com.swarnikacare.encounter.repository;

import com.swarnikacare.encounter.entity.Admission;
import com.swarnikacare.encounter.entity.AdmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {
    Optional<Admission> findByAdmissionNumber(String admissionNumber);
    List<Admission> findByHospitalId(Long hospitalId);
    List<Admission> findByPatientId(Long patientId);
    List<Admission> findByHospitalIdAndStatus(Long hospitalId, AdmissionStatus status);
    List<Admission> findByHospitalIdAndPatientId(Long hospitalId, Long patientId);
    boolean existsByBedIdAndStatus(Long bedId, AdmissionStatus status);
    boolean existsByPatientIdAndStatusIn(Long patientId, List<AdmissionStatus> statuses);
}
