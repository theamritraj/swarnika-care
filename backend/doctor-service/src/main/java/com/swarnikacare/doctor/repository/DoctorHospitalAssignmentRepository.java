package com.swarnikacare.doctor.repository;

import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorHospitalAssignmentRepository extends JpaRepository<DoctorHospitalAssignment, Long> {
    List<DoctorHospitalAssignment> findByDoctorId(Long doctorId);
    List<DoctorHospitalAssignment> findByHospitalId(Long hospitalId);
    List<DoctorHospitalAssignment> findByDepartmentId(Long departmentId);
    List<DoctorHospitalAssignment> findByHospitalIdAndDepartmentId(Long hospitalId, Long departmentId);
    boolean existsByDoctorIdAndHospitalId(Long doctorId, Long hospitalId);
    boolean existsByDoctorIdAndHospitalIdAndDepartmentId(Long doctorId, Long hospitalId, Long departmentId);
}
