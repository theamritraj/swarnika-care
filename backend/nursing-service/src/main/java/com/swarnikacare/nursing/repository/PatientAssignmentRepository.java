package com.swarnikacare.nursing.repository;

import com.swarnikacare.nursing.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface PatientAssignmentRepository extends JpaRepository<PatientAssignment, Long> {
    
    List<PatientAssignment> findByNurseUserIdAndHospitalIdAndStatus(String nurseUserId, Long hospitalId, String status);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM PatientAssignment p WHERE p.patientId = :patientId AND p.nurseUserId = :nurseUserId AND p.hospitalId = :hospitalId AND p.status = 'ACTIVE'")
    boolean existsActiveAssignmentForNurse(@Param("patientId") Long patientId, @Param("nurseUserId") String nurseUserId, @Param("hospitalId") Long hospitalId);
}
