package com.swarnikacare.nursing.repository;

import com.swarnikacare.nursing.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NurseDutyAssignmentRepository extends JpaRepository<NurseDutyAssignment, Long> {
}
