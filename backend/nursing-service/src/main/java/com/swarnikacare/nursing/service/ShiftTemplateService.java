package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.ShiftTemplate;
import com.swarnikacare.nursing.repository.ShiftTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ShiftTemplateService {
    @Autowired
    private ShiftTemplateRepository repository;

    public List<ShiftTemplate> findByHospitalId(Long hospitalId) {
        // Normally you'd add a repository method findByHospitalId, for now we assume it exists or will be added
        return repository.findAll().stream().filter(s -> s.getHospitalId().equals(hospitalId)).toList();
    }
    
    public ShiftTemplate save(ShiftTemplate template) {
        return repository.save(template);
    }
}
