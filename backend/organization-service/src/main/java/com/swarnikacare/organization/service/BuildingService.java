package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.BuildingRequest;
import com.swarnikacare.organization.entity.Building;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.exception.*;
import com.swarnikacare.organization.repository.BuildingRepository;
import com.swarnikacare.organization.repository.FloorRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BuildingService {
    private final BuildingRepository buildingRepository;
    private final HospitalRepository hospitalRepository;
    private final FloorRepository floorRepository;

    public BuildingService(BuildingRepository buildingRepository, HospitalRepository hospitalRepository, FloorRepository floorRepository) {
        this.buildingRepository = buildingRepository;
        this.hospitalRepository = hospitalRepository;
        this.floorRepository = floorRepository;
    }


    public List<Building> findAllByHospital(Long hospitalId) {
        return buildingRepository.findByHospitalId(hospitalId);
    }

    public Building findById(Long id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new BuildingNotFoundException("Building not found"));
    }

    @Transactional
    public Building create(BuildingRequest request) {
        hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found"));

        if (buildingRepository.findByHospitalIdAndCode(request.getHospitalId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Building code already exists in hospital");
        }

        Building building = new Building();
        building.setHospitalId(request.getHospitalId());
        building.setCode(request.getCode());
        building.setName(request.getName());
        building.setDescription(request.getDescription());
        building.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            building.setStatus(request.getStatus());
        }
        return buildingRepository.save(building);
    }

    @Transactional
    public Building update(Long id, BuildingRequest request) {
        Building building = findById(id);
        
        if (!building.getHospitalId().equals(request.getHospitalId())) {
            throw new InvalidHierarchyException("Cannot change hospital of a building");
        }

        if (!building.getCode().equals(request.getCode()) &&
            buildingRepository.findByHospitalIdAndCode(request.getHospitalId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Building code already exists in hospital");
        }

        building.setCode(request.getCode());
        building.setName(request.getName());
        building.setDescription(request.getDescription());
        building.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            building.setStatus(request.getStatus());
        }
        return buildingRepository.save(building);
    }

    @Transactional
    public void delete(Long id) {
        Building building = findById(id);
        List<Floor> floors = floorRepository.findByBuildingId(id);
        if (!floors.isEmpty()) {
            throw new InvalidHierarchyException("Cannot delete building containing floors");
        }
        buildingRepository.delete(building);
    }
}
