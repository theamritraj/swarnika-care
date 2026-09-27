package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.NursingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NursingStationRepository extends JpaRepository<NursingStation, Long> {
    List<NursingStation> findByHospitalId(Long hospitalId);
    List<NursingStation> findByUnitId(Long unitId);
    Optional<NursingStation> findByUnitIdAndCode(Long unitId, String code);
}
