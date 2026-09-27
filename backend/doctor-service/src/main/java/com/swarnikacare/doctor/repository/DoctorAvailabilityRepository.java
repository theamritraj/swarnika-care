package com.swarnikacare.doctor.repository;

import com.swarnikacare.doctor.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    List<DoctorAvailability> findByDoctorId(Long doctorId);
    List<DoctorAvailability> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);
    List<DoctorAvailability> findByHospitalId(Long hospitalId);
    List<DoctorAvailability> findByDepartmentId(Long departmentId);
    List<DoctorAvailability> findByHospitalIdAndDepartmentId(Long hospitalId, Long departmentId);
    List<DoctorAvailability> findByDoctorIdAndHospitalId(Long doctorId, Long hospitalId);
    List<DoctorAvailability> findByDoctorIdAndHospitalIdAndDepartmentId(Long doctorId, Long hospitalId, Long departmentId);
    boolean existsByDoctorIdAndDayOfWeekAndIsActiveTrue(Long doctorId, DayOfWeek dayOfWeek);

    @Query("SELECT d FROM DoctorAvailability d WHERE d.doctorId = :doctorId AND d.dayOfWeek = :dayOfWeek AND d.isActive = true AND (:excludeId IS NULL OR d.id != :excludeId) AND NOT (d.endTime <= :startTime OR d.startTime >= :endTime)")
    List<DoctorAvailability> findOverlappingSlots(
            @Param("doctorId") Long doctorId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );
}
