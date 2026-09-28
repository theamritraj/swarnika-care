package com.swarnikacare.nursing.service;

import com.swarnikacare.nursing.entity.*;
import com.swarnikacare.nursing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@Service
public class VitalsService {
    @Autowired
    private VitalsRepository repository;

    public List<Vitals> findAll() {
        return repository.findAll();
    }
    
    public Vitals save(Vitals entity) {
        return repository.save(entity);
    }
}
