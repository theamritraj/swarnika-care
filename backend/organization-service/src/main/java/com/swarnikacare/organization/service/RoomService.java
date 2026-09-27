package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.RoomRequest;
import com.swarnikacare.organization.entity.Bed;
import com.swarnikacare.organization.entity.Room;
import com.swarnikacare.organization.entity.Unit;
import com.swarnikacare.organization.exception.*;
import com.swarnikacare.organization.repository.BedRepository;
import com.swarnikacare.organization.repository.RoomRepository;
import com.swarnikacare.organization.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final UnitRepository unitRepository;
    private final BedRepository bedRepository;

    public RoomService(RoomRepository roomRepository, UnitRepository unitRepository, BedRepository bedRepository) {
        this.roomRepository = roomRepository;
        this.unitRepository = unitRepository;
        this.bedRepository = bedRepository;
    }


    public List<Room> findAllByUnit(Long unitId) {
        return roomRepository.findByUnitId(unitId);
    }

    public List<Room> findAllByFloor(Long floorId) {
        return roomRepository.findByFloorId(floorId);
    }

    public Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));
    }

    @Transactional
    public Room create(RoomRequest request) {
        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new UnitNotFoundException("Unit not found"));

        if ((request.getFloorId() != null && !unit.getFloorId().equals(request.getFloorId())) ||
            (request.getBuildingId() != null && !unit.getBuildingId().equals(request.getBuildingId())) ||
            (request.getHospitalId() != null && !unit.getHospitalId().equals(request.getHospitalId()))) {
            throw new InvalidHierarchyException("Unit does not belong to the provided floor/building/hospital");
        }

        if (roomRepository.findByUnitIdAndRoomNumber(request.getUnitId(), request.getRoomNumber()).isPresent()) {
            throw new DuplicateResourceException("Room number already exists in unit");
        }

        Room room = new Room();
        room.setHospitalId(unit.getHospitalId());
        room.setBuildingId(unit.getBuildingId());
        room.setFloorId(unit.getFloorId());
        room.setUnitId(unit.getId());
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomName(request.getRoomName());
        room.setRoomType(request.getRoomType());
        if (request.getCapacity() != null) room.setCapacity(request.getCapacity());
        room.setGenderRestriction(request.getGenderRestriction());
        if (request.getStatus() != null) room.setStatus(request.getStatus());

        return roomRepository.save(room);
    }

    @Transactional
    public Room update(Long id, RoomRequest request) {
        Room room = findById(id);

        // hierarchy cannot be changed

        if (!room.getRoomNumber().equals(request.getRoomNumber()) &&
            roomRepository.findByUnitIdAndRoomNumber(request.getUnitId(), request.getRoomNumber()).isPresent()) {
            throw new DuplicateResourceException("Room number already exists in unit");
        }

        room.setRoomNumber(request.getRoomNumber());
        room.setRoomName(request.getRoomName());
        room.setRoomType(request.getRoomType());
        if (request.getCapacity() != null) {
            List<Bed> existingBeds = bedRepository.findByRoomId(id);
            if (request.getCapacity() < existingBeds.size()) {
                throw new IllegalArgumentException("Room capacity cannot be less than the number of existing beds.");
            }
            room.setCapacity(request.getCapacity());
        }
        room.setGenderRestriction(request.getGenderRestriction());
        if (request.getStatus() != null) room.setStatus(request.getStatus());

        return roomRepository.save(room);
    }

    @Transactional
    public void delete(Long id) {
        Room room = findById(id);
        List<Bed> beds = bedRepository.findByRoomId(id);
        if (!beds.isEmpty()) {
            throw new InvalidHierarchyException("Cannot delete room containing beds");
        }
        roomRepository.delete(room);
    }

    @Transactional
    public Room updateStatus(Long id, java.util.Map<String, String> statusUpdate) {
        Room room = findById(id);
        String newStatusStr = statusUpdate.get("status");
        if (newStatusStr == null) throw new IllegalArgumentException("Status is required");

        com.swarnikacare.organization.enums.RoomStatus newStatus = com.swarnikacare.organization.enums.RoomStatus.valueOf(newStatusStr);
        validateTransition(room.getStatus(), newStatus);
        
        room.setStatus(newStatus);
        return roomRepository.save(room);
    }

    private void validateTransition(com.swarnikacare.organization.enums.RoomStatus current, com.swarnikacare.organization.enums.RoomStatus next) {
        if (current == next) return;
        
        boolean valid = false;
        switch (current) {
            case AVAILABLE:
                valid = (next == com.swarnikacare.organization.enums.RoomStatus.OCCUPIED || next == com.swarnikacare.organization.enums.RoomStatus.CLEANING || next == com.swarnikacare.organization.enums.RoomStatus.MAINTENANCE || next == com.swarnikacare.organization.enums.RoomStatus.BLOCKED || next == com.swarnikacare.organization.enums.RoomStatus.INACTIVE);
                break;
            case OCCUPIED:
                valid = (next == com.swarnikacare.organization.enums.RoomStatus.CLEANING || next == com.swarnikacare.organization.enums.RoomStatus.MAINTENANCE || next == com.swarnikacare.organization.enums.RoomStatus.BLOCKED);
                break;
            case CLEANING:
                valid = (next == com.swarnikacare.organization.enums.RoomStatus.AVAILABLE || next == com.swarnikacare.organization.enums.RoomStatus.MAINTENANCE || next == com.swarnikacare.organization.enums.RoomStatus.BLOCKED);
                break;
            case MAINTENANCE:
                valid = (next == com.swarnikacare.organization.enums.RoomStatus.AVAILABLE || next == com.swarnikacare.organization.enums.RoomStatus.BLOCKED || next == com.swarnikacare.organization.enums.RoomStatus.INACTIVE);
                break;
            case BLOCKED:
                valid = (next == com.swarnikacare.organization.enums.RoomStatus.AVAILABLE || next == com.swarnikacare.organization.enums.RoomStatus.MAINTENANCE || next == com.swarnikacare.organization.enums.RoomStatus.INACTIVE);
                break;
            case INACTIVE:
                valid = (next == com.swarnikacare.organization.enums.RoomStatus.AVAILABLE);
                break;
        }

        if (!valid) {
            throw new InvalidStatusTransitionException("Invalid transition from " + current + " to " + next);
        }
    }
}
