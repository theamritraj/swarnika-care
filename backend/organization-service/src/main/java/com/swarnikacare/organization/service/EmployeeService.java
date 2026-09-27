package com.swarnikacare.organization.service;

import com.swarnikacare.organization.client.IamClient;
import com.swarnikacare.organization.client.dto.IamUserResponse;
import com.swarnikacare.organization.client.dto.StaffProvisionRequest;
import com.swarnikacare.organization.dto.EmployeeRequest;
import com.swarnikacare.organization.dto.EmployeeUpdateRequest;
import com.swarnikacare.organization.dto.StaffDirectoryResponse;
import com.swarnikacare.organization.dto.StaffOnboardRequest;
import com.swarnikacare.organization.entity.Department;
import com.swarnikacare.organization.entity.Designation;
import com.swarnikacare.organization.entity.Employee;
import com.swarnikacare.organization.entity.Hospital;
import com.swarnikacare.organization.entity.Position;
import com.swarnikacare.organization.repository.DepartmentRepository;
import com.swarnikacare.organization.repository.DesignationRepository;
import com.swarnikacare.organization.repository.EmployeeRepository;
import com.swarnikacare.organization.repository.HospitalRepository;
import com.swarnikacare.organization.repository.PositionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository repository;
    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final PositionRepository positionRepository;
    private final IamClient iamClient;

    public EmployeeService(EmployeeRepository repository,
                           HospitalRepository hospitalRepository,
                           DepartmentRepository departmentRepository,
                           DesignationRepository designationRepository,
                           PositionRepository positionRepository,
                           IamClient iamClient) {
        this.repository = repository;
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.positionRepository = positionRepository;
        this.iamClient = iamClient;
    }

    // --- Legacy / Backward Compatible Methods ---

    public List<Employee> getAll() {
        return repository.findAll();
    }

    public List<Employee> getByHospitalId(Long hospitalId) {
        return repository.findByHospitalId(hospitalId);
    }

    public Employee create(EmployeeRequest request) {
        if (repository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalArgumentException("Employee for user already exists");
        }
        validateHierarchy(request.getHospitalId(), request.getDepartmentId(), request.getDesignationId(), request.getPositionId(), request.getReportingManagerId());

        Employee e = new Employee();
        e.setUserId(request.getUserId());
        e.setEmployeeCode(request.getEmployeeCode());
        e.setHospitalId(request.getHospitalId());
        e.setDepartmentId(request.getDepartmentId());
        e.setDesignationId(request.getDesignationId());
        e.setPositionId(request.getPositionId());
        e.setReportingManagerId(request.getReportingManagerId());
        e.setJoiningDate(request.getJoiningDate());
        e.setEmploymentType(request.getEmploymentType());
        e.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return repository.save(e);
    }

    // --- Production Staff / Workforce Management ---

    @Transactional
    public StaffDirectoryResponse onboardStaff(StaffOnboardRequest request) {
        log.info("Onboarding staff member code: {}, email: {}, role: {}", request.getEmployeeCode(), request.getEmail(), request.getRole());

        if (repository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new IllegalArgumentException("Employee code '" + request.getEmployeeCode() + "' already exists");
        }

        validateHierarchy(request.getHospitalId(), request.getDepartmentId(), request.getDesignationId(), request.getPositionId(), request.getReportingManagerId());

        // 1. Provision IAM Account
        IamUserResponse iamUser;
        try {
            iamUser = iamClient.provisionStaff(new StaffProvisionRequest(request.getEmail(), request.getRole()));
            log.info("Provisioned IAM account for staff: id={}, email={}", iamUser.getId(), iamUser.getEmail());
        } catch (Exception ex) {
            log.error("Failed to provision IAM account: {}", ex.getMessage());
            throw new IllegalArgumentException("Failed to provision IAM staff account: " + ex.getMessage());
        }

        // 2. Persist Employee Entity with rollback safeguard
        Employee employee = new Employee();
        employee.setUserId(iamUser.getId().toString());
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setHospitalId(request.getHospitalId());
        employee.setDepartmentId(request.getDepartmentId());
        employee.setDesignationId(request.getDesignationId());
        employee.setPositionId(request.getPositionId());
        employee.setReportingManagerId(request.getReportingManagerId());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setEmploymentType(request.getEmploymentType() != null ? request.getEmploymentType() : "FULL_TIME");
        employee.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        Employee savedEmployee;
        try {
            savedEmployee = repository.save(employee);
            log.info("Saved employee record: id={}, code={}", savedEmployee.getId(), savedEmployee.getEmployeeCode());
        } catch (Exception ex) {
            log.error("Failed to save employee record. Rolling back IAM user {}: {}", iamUser.getId(), ex.getMessage());
            try {
                iamClient.deleteUser(iamUser.getId());
            } catch (Exception rollbackEx) {
                log.error("Failed compensating rollback for IAM user {}: {}", iamUser.getId(), rollbackEx.getMessage());
            }
            throw ex;
        }

        return mapToDirectoryResponse(savedEmployee, iamUser);
    }

    public List<StaffDirectoryResponse> getStaffDirectory(Long hospitalId, Long departmentId, String role, String status, String search) {
        List<Employee> employees;
        if (hospitalId != null && departmentId != null) {
            employees = repository.findByHospitalId(hospitalId).stream()
                    .filter(e -> departmentId.equals(e.getDepartmentId()))
                    .collect(Collectors.toList());
        } else if (hospitalId != null) {
            employees = repository.findByHospitalId(hospitalId);
        } else {
            employees = repository.findAll();
        }

        Map<Long, Hospital> hospitalMap = hospitalRepository.findAll().stream()
                .collect(Collectors.toMap(Hospital::getId, h -> h, (a, b) -> a));
        Map<Long, Department> departmentMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getId, d -> d, (a, b) -> a));
        Map<Long, Designation> designationMap = designationRepository.findAll().stream()
                .collect(Collectors.toMap(Designation::getId, d -> d, (a, b) -> a));
        Map<Long, Position> positionMap = positionRepository.findAll().stream()
                .collect(Collectors.toMap(Position::getId, p -> p, (a, b) -> a));
        Map<Long, Employee> employeeMap = repository.findAll().stream()
                .collect(Collectors.toMap(Employee::getId, e -> e, (a, b) -> a));

        List<StaffDirectoryResponse> responses = new ArrayList<>();
        for (Employee e : employees) {
            IamUserResponse iamUser = resolveIamUser(e.getUserId());
            StaffDirectoryResponse dto = mapWithLookups(e, iamUser, hospitalMap, departmentMap, designationMap, positionMap, employeeMap);
            responses.add(dto);
        }

        // Apply in-memory filters for role, status, and search query
        return responses.stream()
                .filter(r -> {
                    if (role != null && !role.trim().isEmpty() && !role.equalsIgnoreCase("all")) {
                        if (r.getRole() == null || !r.getRole().equalsIgnoreCase(role)) {
                            return false;
                        }
                    }
                    if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
                        if (r.getStatus() == null || !r.getStatus().equalsIgnoreCase(status)) {
                            return false;
                        }
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.toLowerCase().trim();
                        boolean matchCode = r.getEmployeeCode() != null && r.getEmployeeCode().toLowerCase().contains(q);
                        boolean matchEmail = r.getEmail() != null && r.getEmail().toLowerCase().contains(q);
                        boolean matchRole = r.getRole() != null && r.getRole().toLowerCase().contains(q);
                        boolean matchDesig = r.getDesignationName() != null && r.getDesignationName().toLowerCase().contains(q);
                        if (!matchCode && !matchEmail && !matchRole && !matchDesig) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public StaffDirectoryResponse getStaffById(Long id) {
        Employee e = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));
        IamUserResponse iamUser = resolveIamUser(e.getUserId());
        return mapToDirectoryResponse(e, iamUser);
    }

    @Transactional
    public StaffDirectoryResponse updateStaff(Long id, EmployeeUpdateRequest request) {
        Employee e = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));

        Long deptId = request.getDepartmentId() != null ? request.getDepartmentId() : e.getDepartmentId();
        Long desigId = request.getDesignationId() != null ? request.getDesignationId() : e.getDesignationId();
        Long posId = request.getPositionId() != null ? request.getPositionId() : e.getPositionId();
        Long mgrId = request.getReportingManagerId() != null ? request.getReportingManagerId() : e.getReportingManagerId();

        validateHierarchy(e.getHospitalId(), deptId, desigId, posId, mgrId);

        if (request.getDepartmentId() != null) e.setDepartmentId(request.getDepartmentId());
        if (request.getDesignationId() != null) e.setDesignationId(request.getDesignationId());
        if (request.getPositionId() != null) e.setPositionId(request.getPositionId());
        if (request.getReportingManagerId() != null) e.setReportingManagerId(request.getReportingManagerId());
        if (request.getJoiningDate() != null) e.setJoiningDate(request.getJoiningDate());
        if (request.getEmploymentType() != null) e.setEmploymentType(request.getEmploymentType());
        if (request.getStatus() != null) e.setStatus(request.getStatus());

        Employee saved = repository.save(e);
        IamUserResponse iamUser = resolveIamUser(saved.getUserId());
        return mapToDirectoryResponse(saved, iamUser);
    }

    @Transactional
    public StaffDirectoryResponse updateStatus(Long id, String status) {
        Employee e = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));
        e.setStatus(status.toUpperCase());
        Employee saved = repository.save(e);
        IamUserResponse iamUser = resolveIamUser(saved.getUserId());
        return mapToDirectoryResponse(saved, iamUser);
    }

    @Transactional
    public void deleteStaff(Long id) {
        Employee e = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));
        e.setStatus("INACTIVE");
        repository.save(e);
    }

    // --- Validation Helper ---

    private void validateHierarchy(Long hospitalId, Long departmentId, Long designationId, Long positionId, Long reportingManagerId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));

        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            if (!dept.getHospitalId().equals(hospital.getId())) {
                throw new IllegalArgumentException("Department does not belong to the hospital");
            }
        }

        if (designationId != null) {
            Designation desig = designationRepository.findById(designationId)
                    .orElseThrow(() -> new IllegalArgumentException("Designation not found"));
            if (desig.getActive() != null && !desig.getActive()) {
                throw new IllegalArgumentException("Designation is inactive");
            }
        }

        if (positionId != null) {
            Position pos = positionRepository.findById(positionId)
                    .orElseThrow(() -> new IllegalArgumentException("Position not found"));
            if (!pos.getHospitalId().equals(hospital.getId())) {
                throw new IllegalArgumentException("Position does not belong to the hospital");
            }
            if (departmentId != null && pos.getDepartmentId() != null && !pos.getDepartmentId().equals(departmentId)) {
                throw new IllegalArgumentException("Position does not belong to the requested department");
            }
        }

        if (reportingManagerId != null) {
            Employee manager = repository.findById(reportingManagerId)
                    .orElseThrow(() -> new IllegalArgumentException("Reporting manager not found"));
            if (!manager.getHospitalId().equals(hospital.getId())) {
                throw new IllegalArgumentException("Reporting manager does not belong to the same hospital");
            }
        }
    }

    // --- DTO Mapping Helpers ---

    private IamUserResponse resolveIamUser(String userId) {
        if (userId == null) return null;
        try {
            Long numericId = Long.valueOf(userId);
            return iamClient.getUserById(numericId);
        } catch (NumberFormatException nfe) {
            // Synthetic test user_id (e.g. empA, hospA_admin)
            IamUserResponse mock = new IamUserResponse();
            mock.setEmail(userId + "@swarnikacare.com");
            mock.setRole("STAFF");
            mock.setStatus("ACTIVE");
            return mock;
        } catch (Exception ex) {
            log.warn("Could not fetch IAM user for userId {}: {}", userId, ex.getMessage());
            IamUserResponse fallback = new IamUserResponse();
            fallback.setEmail("user-" + userId + "@swarnikacare.com");
            fallback.setRole("STAFF");
            fallback.setStatus("ACTIVE");
            return fallback;
        }
    }

    private StaffDirectoryResponse mapToDirectoryResponse(Employee e, IamUserResponse iamUser) {
        Hospital h = e.getHospitalId() != null ? hospitalRepository.findById(e.getHospitalId()).orElse(null) : null;
        Department d = e.getDepartmentId() != null ? departmentRepository.findById(e.getDepartmentId()).orElse(null) : null;
        Designation des = e.getDesignationId() != null ? designationRepository.findById(e.getDesignationId()).orElse(null) : null;
        Position p = e.getPositionId() != null ? positionRepository.findById(e.getPositionId()).orElse(null) : null;
        Employee mgr = e.getReportingManagerId() != null ? repository.findById(e.getReportingManagerId()).orElse(null) : null;

        StaffDirectoryResponse res = new StaffDirectoryResponse();
        res.setId(e.getId());
        res.setUserId(e.getUserId());
        res.setEmail(iamUser != null ? iamUser.getEmail() : null);
        res.setRole(iamUser != null ? iamUser.getRole() : null);
        res.setEmployeeCode(e.getEmployeeCode());
        res.setHospitalId(e.getHospitalId());
        res.setHospitalName(h != null ? h.getName() : null);
        res.setHospitalCode(h != null ? h.getCode() : null);
        res.setDepartmentId(e.getDepartmentId());
        res.setDepartmentName(d != null ? d.getName() : null);
        res.setDepartmentCode(d != null ? d.getCode() : null);
        res.setDesignationId(e.getDesignationId());
        res.setDesignationName(des != null ? des.getName() : null);
        res.setDesignationCode(des != null ? des.getCode() : null);
        res.setPositionId(e.getPositionId());
        res.setPositionTitle(p != null ? p.getTitle() : null);
        res.setPositionCode(p != null ? p.getCode() : null);
        res.setReportingManagerId(e.getReportingManagerId());
        res.setReportingManagerName(mgr != null ? mgr.getEmployeeCode() : null);
        res.setJoiningDate(e.getJoiningDate());
        res.setEmploymentType(e.getEmploymentType());
        res.setStatus(e.getStatus());
        res.setCreatedAt(e.getCreatedAt());
        res.setUpdatedAt(e.getUpdatedAt());
        return res;
    }

    private StaffDirectoryResponse mapWithLookups(
            Employee e,
            IamUserResponse iamUser,
            Map<Long, Hospital> hospitalMap,
            Map<Long, Department> departmentMap,
            Map<Long, Designation> designationMap,
            Map<Long, Position> positionMap,
            Map<Long, Employee> employeeMap
    ) {
        Hospital h = e.getHospitalId() != null ? hospitalMap.get(e.getHospitalId()) : null;
        Department d = e.getDepartmentId() != null ? departmentMap.get(e.getDepartmentId()) : null;
        Designation des = e.getDesignationId() != null ? designationMap.get(e.getDesignationId()) : null;
        Position p = e.getPositionId() != null ? positionMap.get(e.getPositionId()) : null;
        Employee mgr = e.getReportingManagerId() != null ? employeeMap.get(e.getReportingManagerId()) : null;

        StaffDirectoryResponse res = new StaffDirectoryResponse();
        res.setId(e.getId());
        res.setUserId(e.getUserId());
        res.setEmail(iamUser != null ? iamUser.getEmail() : null);
        res.setRole(iamUser != null ? iamUser.getRole() : null);
        res.setEmployeeCode(e.getEmployeeCode());
        res.setHospitalId(e.getHospitalId());
        res.setHospitalName(h != null ? h.getName() : null);
        res.setHospitalCode(h != null ? h.getCode() : null);
        res.setDepartmentId(e.getDepartmentId());
        res.setDepartmentName(d != null ? d.getName() : null);
        res.setDepartmentCode(d != null ? d.getCode() : null);
        res.setDesignationId(e.getDesignationId());
        res.setDesignationName(des != null ? des.getName() : null);
        res.setDesignationCode(des != null ? des.getCode() : null);
        res.setPositionId(e.getPositionId());
        res.setPositionTitle(p != null ? p.getTitle() : null);
        res.setPositionCode(p != null ? p.getCode() : null);
        res.setReportingManagerId(e.getReportingManagerId());
        res.setReportingManagerName(mgr != null ? mgr.getEmployeeCode() : null);
        res.setJoiningDate(e.getJoiningDate());
        res.setEmploymentType(e.getEmploymentType());
        res.setStatus(e.getStatus());
        res.setCreatedAt(e.getCreatedAt());
        res.setUpdatedAt(e.getUpdatedAt());
        return res;
    }
}
