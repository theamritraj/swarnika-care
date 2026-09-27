package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.DesignationRequest;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.repository.DesignationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DesignationService {
    private final DesignationRepository repository;

    public DesignationService(DesignationRepository repository) {
        this.repository = repository;
    }

    public List<Designation> getAll() {
        return repository.findAll();
    }

    public Designation create(DesignationRequest request) {
        if(repository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Designation code already exists");
        }
        Designation d = new Designation();
        d.setCode(request.getCode());
        d.setName(request.getName());
        d.setDescription(request.getDescription());
        d.setFunctionalArea(request.getFunctionalArea());
        d.setActive(request.getActive() != null ? request.getActive() : true);
        return repository.save(d);
    }
}
