package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.DepartmentCreateRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.List;
import java.time.Duration;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final HospitalRepository hospitalRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public DepartmentService(DepartmentRepository departmentRepository, HospitalRepository hospitalRepository, RedisTemplate<String, Object> redisTemplate) {
        this.departmentRepository = departmentRepository;
        this.hospitalRepository = hospitalRepository;
        this.redisTemplate = redisTemplate;
    }
    
    private String getDepartmentCacheKey(Long id) {
        return "swarnika:prod:organization:department:" + id;
    }
    
    private void evictDepartmentCache(Long id) {
        try {
            redisTemplate.delete(getDepartmentCacheKey(id));
        } catch (Exception e) {}
    }

    public Department createDepartment(DepartmentCreateRequest request) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        if (departmentRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Department code already exists");
        }

        Department department = new Department();
        department.setHospitalId(hospital.getId());
        department.setCode(request.getCode());
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setHeadDoctorId(request.getHeadDoctorId());
        department.setPublicVisibility(request.getPublicVisibility() != null ? request.getPublicVisibility() : true);
        department.setStatus("ACTIVE");

        return departmentRepository.save(department);
    }

    public List<Department> getDepartmentsByHospital(Long hospitalId) {
        return departmentRepository.findByHospitalId(hospitalId);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        String cacheKey = getDepartmentCacheKey(id);
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                if (cached instanceof Department) return (Department) cached;
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                return mapper.convertValue(cached, Department.class);
            }
        } catch (Exception e) {}

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
                
        try {
            redisTemplate.opsForValue().set(cacheKey, department, Duration.ofMinutes(15));
        } catch (Exception e) {}
        
        return department;
    }

    public Department updateDepartment(Long id, DepartmentCreateRequest request) {
        Department department = getDepartmentById(id);
        if (request.getName() != null && !request.getName().isBlank()) department.setName(request.getName());
        if (request.getDescription() != null) department.setDescription(request.getDescription());
        if (request.getHeadDoctorId() != null) department.setHeadDoctorId(request.getHeadDoctorId());
        if (request.getPublicVisibility() != null) department.setPublicVisibility(request.getPublicVisibility());
        
        Department saved = departmentRepository.save(department);
        evictDepartmentCache(id);
        return saved;
    }
}
