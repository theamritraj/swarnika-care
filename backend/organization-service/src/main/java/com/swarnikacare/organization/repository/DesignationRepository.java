package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
    Optional<Designation> findByCode(String code);
}
