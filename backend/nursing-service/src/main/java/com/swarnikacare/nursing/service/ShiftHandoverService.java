package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.ShiftHandover;
import com.swarnikacare.nursing.repository.ShiftHandoverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShiftHandoverService {
    
    @Autowired
    private ShiftHandoverRepository repository;
    
    public ShiftHandover save(ShiftHandover handover) {
        return repository.save(handover);
    }
    
    public List<ShiftHandover> getHandoversForNurse(String nurseId, Long hospitalId) {
        return repository.findByToNurseUserIdAndHospitalId(nurseId, hospitalId);
    }
}
