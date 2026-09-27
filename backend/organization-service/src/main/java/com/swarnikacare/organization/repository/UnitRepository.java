package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {
    List<Unit> findByHospitalId(Long hospitalId);
    List<Unit> findByFloorId(Long floorId);
    Optional<Unit> findByHospitalIdAndCode(Long hospitalId, String code);
}
