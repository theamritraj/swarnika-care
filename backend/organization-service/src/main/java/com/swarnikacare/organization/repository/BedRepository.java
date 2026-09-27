package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByHospitalId(Long hospitalId);
    List<Bed> findByRoomId(Long roomId);
    Optional<Bed> findByRoomIdAndBedNumber(Long roomId, String bedNumber);
}
