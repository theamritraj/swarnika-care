package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHospitalId(Long hospitalId);
    List<Room> findByUnitId(Long unitId);
    List<Room> findByFloorId(Long floorId);
    Optional<Room> findByUnitIdAndRoomNumber(Long unitId, String roomNumber);
}
