package com.swarnikacare.patient.repository;

import com.swarnikacare.patient.entity.PregnancyLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PregnancyLeadRepository extends JpaRepository<PregnancyLead, Long> {
}
