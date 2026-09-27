package com.swarnikacare.organization.service;

import com.swarnikacare.organization.dto.BedRequest;
import com.swarnikacare.organization.entity.Bed;
import com.swarnikacare.organization.entity.Room;
import com.swarnikacare.organization.enums.BedStatus;
import com.swarnikacare.organization.exception.*;
import com.swarnikacare.organization.repository.BedRepository;
import com.swarnikacare.organization.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class BedService {
    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;

    public BedService(BedRepository bedRepository, RoomRepository roomRepository) {
        this.bedRepository = bedRepository;
        this.roomRepository = roomRepository;
    }


    public List<Bed> findAllByRoom(Long roomId) {
        return bedRepository.findByRoomId(roomId);
    }

    public Bed findById(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new BedNotFoundException("Bed not found"));
    }

    @Transactional
    public Bed create(BedRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RoomNotFoundException("Room not found"));

        if ((request.getUnitId() != null && !room.getUnitId().equals(request.getUnitId())) ||
            (request.getFloorId() != null && !room.getFloorId().equals(request.getFloorId())) ||
            (request.getBuildingId() != null && !room.getBuildingId().equals(request.getBuildingId())) ||
            (request.getHospitalId() != null && !room.getHospitalId().equals(request.getHospitalId()))) {
            throw new InvalidHierarchyException("Room does not match the provided hierarchy");
        }

        if (bedRepository.findByRoomIdAndBedNumber(request.getRoomId(), request.getBedNumber()).isPresent()) {
            throw new DuplicateResourceException("Bed number already exists in room");
        }

        List<Bed> existingBeds = bedRepository.findByRoomId(room.getId());
        if (room.getCapacity() != null && existingBeds.size() >= room.getCapacity()) {
            throw new IllegalArgumentException("Room capacity reached. No additional beds can be added.");
        }

        Bed bed = new Bed();
        bed.setHospitalId(room.getHospitalId());
        bed.setBuildingId(room.getBuildingId());
        bed.setFloorId(room.getFloorId());
        bed.setUnitId(room.getUnitId());
        bed.setRoomId(room.getId());
        bed.setBedNumber(request.getBedNumber());
        bed.setBedType(request.getBedType());
        if (request.getStatus() != null) bed.setStatus(request.getStatus());
        bed.setGenderRestriction(request.getGenderRestriction());
        if (request.getIsIsolation() != null) bed.setIsIsolation(request.getIsIsolation());

        return bedRepository.save(bed);
    }

    @Transactional
    public Bed update(Long id, BedRequest request) {
        Bed bed = findById(id);

        // hierarchy cannot be changed

        if (!bed.getBedNumber().equals(request.getBedNumber()) &&
            bedRepository.findByRoomIdAndBedNumber(request.getRoomId(), request.getBedNumber()).isPresent()) {
            throw new DuplicateResourceException("Bed number already exists in room");
        }

        bed.setBedNumber(request.getBedNumber());
        bed.setBedType(request.getBedType());
        bed.setGenderRestriction(request.getGenderRestriction());
        if (request.getIsIsolation() != null) bed.setIsIsolation(request.getIsIsolation());

        return bedRepository.save(bed);
    }

    @Transactional
    public Bed updateStatus(Long id, Map<String, String> statusUpdate) {
        Bed bed = findById(id);
        String newStatusStr = statusUpdate.get("status");
        if (newStatusStr == null) throw new IllegalArgumentException("Status is required");

        BedStatus newStatus = BedStatus.valueOf(newStatusStr);
        validateTransition(bed.getStatus(), newStatus);
        
        bed.setStatus(newStatus);
        return bedRepository.save(bed);
    }

    private void validateTransition(BedStatus current, BedStatus next) {
        if (current == next) return;
        
        boolean valid = false;
        switch (current) {
            case AVAILABLE:
                valid = (next == BedStatus.RESERVED || next == BedStatus.OCCUPIED || next == BedStatus.BLOCKED || next == BedStatus.MAINTENANCE);
                break;
            case RESERVED:
                valid = (next == BedStatus.OCCUPIED || next == BedStatus.AVAILABLE);
                break;
            case OCCUPIED:
                valid = (next == BedStatus.CLEANING);
                if (next == BedStatus.AVAILABLE) {
                    throw new InvalidStatusTransitionException("OCCUPIED to AVAILABLE transition requires discharge/transfer workflow");
                }
                break;
            case CLEANING:
            case MAINTENANCE:
            case BLOCKED:
                valid = (next == BedStatus.AVAILABLE);
                break;
        }

        if (!valid) {
            throw new InvalidStatusTransitionException("Invalid transition from " + current + " to " + next);
        }
    }

    @Transactional
    public void delete(Long id) {
        Bed bed = findById(id);
        bedRepository.delete(bed);
    }
}
