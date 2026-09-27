package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.NursingStationRequest;
import com.swarnikacare.organization.entity.NursingStation;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.exception.*;
import com.swarnikacare.organization.repository.NursingStationRepository;
import com.swarnikacare.organization.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NursingStationService {
    private final NursingStationRepository nursingStationRepository;
    private final UnitRepository unitRepository;

    public NursingStationService(NursingStationRepository nursingStationRepository, UnitRepository unitRepository) {
        this.nursingStationRepository = nursingStationRepository;
        this.unitRepository = unitRepository;
    }


    public List<NursingStation> findAllByUnit(Long unitId) {
        return nursingStationRepository.findByUnitId(unitId);
    }

    public NursingStation findById(Long id) {
        return nursingStationRepository.findById(id)
                .orElseThrow(() -> new NursingStationNotFoundException("Nursing Station not found"));
    }

    @Transactional
    public NursingStation create(NursingStationRequest request) {
        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new UnitNotFoundException("Unit not found"));

        if ((request.getFloorId() != null && !unit.getFloorId().equals(request.getFloorId())) ||
            (request.getBuildingId() != null && !unit.getBuildingId().equals(request.getBuildingId())) ||
            (request.getHospitalId() != null && !unit.getHospitalId().equals(request.getHospitalId()))) {
            throw new InvalidHierarchyException("Unit does not belong to the provided floor/building/hospital");
        }

        if (nursingStationRepository.findByUnitIdAndCode(request.getUnitId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Nursing station code already exists in unit");
        }

        NursingStation station = new NursingStation();
        station.setHospitalId(unit.getHospitalId());
        station.setBuildingId(unit.getBuildingId());
        station.setFloorId(unit.getFloorId());
        station.setUnitId(unit.getId());
        station.setCode(request.getCode());
        station.setName(request.getName());
        station.setDescription(request.getDescription());
        station.setLocation(request.getLocation());
        if (request.getStatus() != null) station.setStatus(request.getStatus());

        return nursingStationRepository.save(station);
    }

    @Transactional
    public NursingStation update(Long id, NursingStationRequest request) {
        NursingStation station = findById(id);

        // hierarchy cannot be changed

        if (!station.getCode().equals(request.getCode()) &&
            nursingStationRepository.findByUnitIdAndCode(request.getUnitId(), request.getCode()).isPresent()) {
            throw new DuplicateResourceException("Nursing station code already exists in unit");
        }

        station.setCode(request.getCode());
        station.setName(request.getName());
        station.setDescription(request.getDescription());
        station.setLocation(request.getLocation());
        if (request.getStatus() != null) station.setStatus(request.getStatus());

        return nursingStationRepository.save(station);
    }

    @Transactional
    public void delete(Long id) {
        NursingStation station = findById(id);
        nursingStationRepository.delete(station);
    }
}
