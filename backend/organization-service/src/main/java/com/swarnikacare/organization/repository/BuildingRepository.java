package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    List<Building> findByHospitalId(Long hospitalId);
    Optional<Building> findByHospitalIdAndCode(Long hospitalId, String code);
}
