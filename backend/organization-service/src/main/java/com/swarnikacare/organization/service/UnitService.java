package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.UnitRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Floor;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.entity.Room;
import com.swarnikacare.organization.entity.NursingStation;
import com.swarnikacare.organization.exception.*;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.FloorRepository;
import com.swarnikacare.organization.repository.UnitRepository;
import com.swarnikacare.organization.repository.RoomRepository;
import com.swarnikacare.organization.repository.NursingStationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnitService {
    private final UnitRepository unitRepository;
    private final FloorRepository floorRepository;
    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final NursingStationRepository nursingStationRepository;

    public UnitService(UnitRepository unitRepository, FloorRepository floorRepository, DepartmentRepository departmentRepository, RoomRepository roomRepository, NursingStationRepository nursingStationRepository) {
        this.unitRepository = unitRepository;
        this.floorRepository = floorRepository;
        this.departmentRepository = departmentRepository;
        this.roomRepository = roomRepository;
        this.nursingStationRepository = nursingStationRepository;
    }


    public List<Unit> findAllByFloor(Long floorId) {
        return unitRepository.findByFloorId(floorId);
    }

    public Unit findById(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() -> new UnitNotFoundException("Unit not found"));
    }

    @Transactional
    public Unit create(UnitRequest request) {
        Floor floor = floorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new FloorNotFoundException("Floor not found"));

        if (!floor.getBuildingId().equals(request.getBuildingId()) || 
            !floor.getHospitalId().equals(request.getHospitalId())) {
            throw new InvalidHierarchyException("Floor does not belong to the provided building/hospital");
        }

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            if (!dept.getHospitalId().equals(request.getHospitalId())) {
                throw new InvalidHierarchyException("Department does not belong to the hospital");
            }
        }

        if (unitRepository.findByHospitalIdAndCode(request.getHospitalId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Unit code already exists in hospital");
        }

        Unit unit = new Unit();
        unit.setHospitalId(floor.getHospitalId());
        unit.setBuildingId(floor.getBuildingId());
        unit.setFloorId(floor.getId());
        unit.setDepartmentId(request.getDepartmentId());
        unit.setCode(request.getCode());
        unit.setName(request.getName());
        unit.setType(request.getType());
        unit.setDescription(request.getDescription());
        if (request.getCapacity() != null) unit.setCapacity(request.getCapacity());
        unit.setGenderRestriction(request.getGenderRestriction());
        unit.setAgeGroup(request.getAgeGroup());
        if (request.getStatus() != null) unit.setStatus(request.getStatus());
        if (request.getPublicVisibility() != null) unit.setPublicVisibility(request.getPublicVisibility());
        
        return unitRepository.save(unit);
    }

    @Transactional
    public Unit update(Long id, UnitRequest request) {
        Unit unit = findById(id);
        
        // hierarchy cannot be changed

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            if (!dept.getHospitalId().equals(request.getHospitalId())) {
                throw new InvalidHierarchyException("Department does not belong to the hospital");
            }
        }

        if (!unit.getCode().equals(request.getCode()) &&
            unitRepository.findByHospitalIdAndCode(request.getHospitalId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Unit code already exists in hospital");
        }

        unit.setDepartmentId(request.getDepartmentId());
        unit.setCode(request.getCode());
        unit.setName(request.getName());
        unit.setType(request.getType());
        unit.setDescription(request.getDescription());
        if (request.getCapacity() != null) unit.setCapacity(request.getCapacity());
        unit.setGenderRestriction(request.getGenderRestriction());
        unit.setAgeGroup(request.getAgeGroup());
        if (request.getStatus() != null) unit.setStatus(request.getStatus());
        if (request.getPublicVisibility() != null) unit.setPublicVisibility(request.getPublicVisibility());

        return unitRepository.save(unit);
    }

    @Transactional
    public void delete(Long id) {
        Unit unit = findById(id);
        List<Room> rooms = roomRepository.findByUnitId(id);
        if (!rooms.isEmpty()) {
            throw new InvalidHierarchyException("Cannot delete unit containing rooms");
        }
        List<NursingStation> ns = nursingStationRepository.findByUnitId(id);
        if (!ns.isEmpty()) {
            throw new InvalidHierarchyException("Cannot delete unit containing nursing stations");
        }
        unitRepository.delete(unit);
    }
}
