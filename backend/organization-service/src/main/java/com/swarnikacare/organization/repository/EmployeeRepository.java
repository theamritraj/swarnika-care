package com.swarnikacare.organization.repository;

import com.swarnikacare.organization.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserId(String userId);
    boolean existsByUserId(String userId);
    boolean existsByEmployeeCode(String employeeCode);
    List<Employee> findByHospitalId(Long hospitalId);
    List<Employee> findByDepartmentId(Long departmentId);
}
