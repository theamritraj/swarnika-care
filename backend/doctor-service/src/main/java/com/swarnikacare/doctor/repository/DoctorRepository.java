package com.swarnikacare.doctor.repository;

import com.swarnikacare.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(String userId);
    Optional<Doctor> findByEmail(String email);
    List<Doctor> findByStatus(String status);
}
