package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.NursingAssessment;
import com.swarnikacare.nursing.repository.NursingAssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NursingAssessmentService {
    
    @Autowired
    private NursingAssessmentRepository repository;
    
    public NursingAssessment save(NursingAssessment assessment) {
        return repository.save(assessment);
    }
    
    public List<NursingAssessment> findByPatientIdAndHospitalId(Long patientId, Long hospitalId) {
        return repository.findByPatientIdAndHospitalId(patientId, hospitalId);
    }
    
    public NursingAssessment findById(Long id) {
        return repository.findById(id).orElse(null);
    }
}
