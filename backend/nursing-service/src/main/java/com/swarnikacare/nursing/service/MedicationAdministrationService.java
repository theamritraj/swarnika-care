package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.MedicationAdministrationRecord;
import com.swarnikacare.nursing.repository.MedicationAdministrationRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicationAdministrationService {
    
    @Autowired
    private MedicationAdministrationRecordRepository repository;
    
    public MedicationAdministrationRecord save(MedicationAdministrationRecord record) {
        return repository.save(record);
    }
    
    public List<MedicationAdministrationRecord> findByPatientIdAndHospitalId(Long patientId, Long hospitalId) {
        return repository.findByPatientIdAndHospitalId(patientId, hospitalId);
    }
}
