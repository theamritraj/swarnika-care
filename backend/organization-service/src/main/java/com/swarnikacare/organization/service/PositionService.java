package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.PositionRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.entity.Position;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.DesignationRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import com.swarnikacare.organization.repository.PositionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PositionService {
    private final PositionRepository repository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;

    public PositionService(PositionRepository repository,
                           HospitalRepository hospitalRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository) {
        this.repository = repository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
    }

    public List<Position> getAll() {
        return repository.findAll();
    }

    public List<Position> getByHospitalId(Long hospitalId) {
        return repository.findByHospitalId(hospitalId);
    }

    public Position create(PositionRequest request) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
            .orElseThrow(() -> new RuntimeException("Hospital not found"));
            
        Department dept = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));
        if (!dept.getHospitalId().equals(hospital.getId())) {
            throw new RuntimeException("Department does not belong to the hospital");
        }
        
        Designation desig = designationRepository.findById(request.getDesignationId())
            .orElseThrow(() -> new RuntimeException("Designation not found"));
        if (desig.getActive() != null && !desig.getActive()) {
            throw new RuntimeException("Designation is inactive");
        }
        
        if (request.getReportsToPositionId() != null) {
            Position mgrPos = repository.findById(request.getReportsToPositionId())
                .orElseThrow(() -> new RuntimeException("Reporting position not found"));
            if (!mgrPos.getHospitalId().equals(hospital.getId())) {
                throw new RuntimeException("Reporting position does not belong to the same hospital");
            }
        }

        Position p = new Position();
        p.setHospitalId(request.getHospitalId());
        p.setDepartmentId(request.getDepartmentId());
        p.setDesignationId(request.getDesignationId());
        p.setCode(request.getCode());
        p.setTitle(request.getTitle());
        p.setDescription(request.getDescription());
        p.setReportsToPositionId(request.getReportsToPositionId());
        p.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return repository.save(p);
    }
}
