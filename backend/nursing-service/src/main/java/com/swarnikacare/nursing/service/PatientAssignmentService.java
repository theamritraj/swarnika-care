package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.*;
import com.swarnikacare.nursing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class PatientAssignmentService {
    @Autowired
    private PatientAssignmentRepository repository;

    public List<PatientAssignment> findAll() {
        return repository.findAll();
    }
    
    public PatientAssignment save(PatientAssignment entity) {
        return repository.save(entity);
    }
    
    public List<PatientAssignment> findMyPatients(String nurseUserId, Long hospitalId) {
        return repository.findByNurseUserIdAndHospitalIdAndStatus(nurseUserId, hospitalId, "ACTIVE");
    }
    
    public boolean isPatientAssignedToNurse(Long patientId, String nurseUserId, Long hospitalId) {
        return repository.existsActiveAssignmentForNurse(patientId, nurseUserId, hospitalId);
    }
}
