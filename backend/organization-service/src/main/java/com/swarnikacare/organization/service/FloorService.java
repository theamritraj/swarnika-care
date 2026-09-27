package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.FloorRequest;
import com.swarnikacare.organization.entity.Building;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.exception.*;
import com.swarnikacare.organization.repository.BuildingRepository;
import com.swarnikacare.organization.repository.FloorRepository;
import com.swarnikacare.organization.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FloorService {
    private final FloorRepository floorRepository;
    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;

    public FloorService(FloorRepository floorRepository, BuildingRepository buildingRepository, UnitRepository unitRepository) {
        this.floorRepository = floorRepository;
        this.buildingRepository = buildingRepository;
        this.unitRepository = unitRepository;
    }


    public List<Floor> findAllByBuilding(Long buildingId) {
        return floorRepository.findByBuildingId(buildingId);
    }

    public Floor findById(Long id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new FloorNotFoundException("Floor not found"));
    }

    @Transactional
    public Floor create(FloorRequest request) {
        Building building = buildingRepository.findById(request.getBuildingId())
                .orElseThrow(() -> new BuildingNotFoundException("Building not found"));

        if (request.getHospitalId() != null && !building.getHospitalId().equals(request.getHospitalId())) {
            throw new InvalidHierarchyException("Building does not belong to the provided hospital");
        }

        if (floorRepository.findByBuildingIdAndCode(request.getBuildingId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Floor code already exists in building");
        }
        if (floorRepository.findByBuildingIdAndFloorNumber(request.getBuildingId(), request.getFloorNumber()).isPresent()) {
            throw new DuplicateResourceException("Floor number already exists in building");
        }

        Floor floor = new Floor();
        floor.setHospitalId(building.getHospitalId());
        floor.setBuildingId(building.getId());
        floor.setFloorNumber(request.getFloorNumber());
        floor.setCode(request.getCode());
        floor.setName(request.getName());
        floor.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            floor.setStatus(request.getStatus());
        }
        return floorRepository.save(floor);
    }

    @Transactional
    public Floor update(Long id, FloorRequest request) {
        Floor floor = findById(id);
        
        if (!floor.getHospitalId().equals(request.getHospitalId()) ||
            !floor.getBuildingId().equals(request.getBuildingId())) {
            throw new InvalidHierarchyException("Cannot change hospital or building of a floor");
        }

        if (!floor.getCode().equals(request.getCode()) &&
            floorRepository.findByBuildingIdAndCode(request.getBuildingId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Floor code already exists in building");
        }
        if (!floor.getFloorNumber().equals(request.getFloorNumber()) &&
            floorRepository.findByBuildingIdAndFloorNumber(request.getBuildingId(), request.getFloorNumber()).isPresent()) {
            throw new DuplicateResourceException("Floor number already exists in building");
        }

        floor.setFloorNumber(request.getFloorNumber());
        floor.setCode(request.getCode());
        floor.setName(request.getName());
        floor.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            floor.setStatus(request.getStatus());
        }
        return floorRepository.save(floor);
    }

    @Transactional
    public void delete(Long id) {
        Floor floor = findById(id);
        List<Unit> units = unitRepository.findByFloorId(id);
        if (!units.isEmpty()) {
            throw new InvalidHierarchyException("Cannot delete floor containing units");
        }
        floorRepository.delete(floor);
    }
}
