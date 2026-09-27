package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    List<Floor> findByHospitalId(Long hospitalId);
    List<Floor> findByBuildingId(Long buildingId);
    Optional<Floor> findByBuildingIdAndCode(Long buildingId, String code);
    Optional<Floor> findByBuildingIdAndFloorNumber(Long buildingId, Integer floorNumber);
}
