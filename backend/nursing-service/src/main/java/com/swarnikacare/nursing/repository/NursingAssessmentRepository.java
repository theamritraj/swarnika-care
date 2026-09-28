package com.swarnikacare.nursing.repository;

import com.swarnikacare.nursing.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NursingAssessmentRepository extends JpaRepository<NursingAssessment, Long> {
    List<NursingAssessment> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
}
