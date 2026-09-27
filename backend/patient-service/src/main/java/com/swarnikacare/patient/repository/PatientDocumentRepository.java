package com.swarnikacare.patient.repository;

import com.swarnikacare.patient.entity.PatientDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientDocumentRepository extends JpaRepository<PatientDocument, Long> {
    List<PatientDocument> findByPatientId(Long patientId);
    List<PatientDocument> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
}
