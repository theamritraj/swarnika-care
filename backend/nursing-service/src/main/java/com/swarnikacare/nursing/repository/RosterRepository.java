package com.swarnikacare.nursing.repository;

import com.swarnikacare.nursing.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RosterRepository extends JpaRepository<Roster, Long> {
    List<Roster> findByHospitalId(Long hospitalId);
}
