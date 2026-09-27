package com.swarnikacare.appointment.repository;

import com.swarnikacare.appointment.entity.DoctorScheduleLock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DoctorScheduleLockRepository extends JpaRepository<DoctorScheduleLock, Long> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM DoctorScheduleLock d WHERE d.doctorId = :doctorId")
    Optional<DoctorScheduleLock> findByDoctorIdForUpdate(@Param("doctorId") Long doctorId);
}
