package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.Roster;
import com.swarnikacare.nursing.repository.RosterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RosterService {
    
    @Autowired
    private RosterRepository repository;
    
    public Roster save(Roster roster) {
        return repository.save(roster);
    }
    
    public List<Roster> findByHospitalId(Long hospitalId) {
        return repository.findByHospitalId(hospitalId);
    }
}
