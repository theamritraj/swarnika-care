package com.swarnikacare.doctor.repository;

import com.swarnikacare.doctor.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByDoctorId(Long doctorId);
    java.util.List<DoctorProfile> findByStatus(com.swarnikacare.doctor.entity.PublicProfileStatus status);
}
