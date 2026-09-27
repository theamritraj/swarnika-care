package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.OrganizationClient;
import com.swarnikacare.doctor.dto.DoctorAssignmentRequest;
import com.swarnikacare.doctor.dto.DoctorAssignmentResponse;
import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import com.swarnikacare.doctor.exception.DoctorNotFoundException;
import com.swarnikacare.doctor.exception.DuplicateResourceException;
import com.swarnikacare.doctor.exception.InvalidHierarchyException;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DoctorAssignmentServiceImpl implements DoctorAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(DoctorAssignmentServiceImpl.class);

    private final DoctorHospitalAssignmentRepository assignmentRepository;
    private final DoctorRepository doctorRepository;
    private final OrganizationClient organizationClient;

    public DoctorAssignmentServiceImpl(
            DoctorHospitalAssignmentRepository assignmentRepository,
            DoctorRepository doctorRepository,
            OrganizationClient organizationClient) {
        this.assignmentRepository = assignmentRepository;
        this.doctorRepository = doctorRepository;
        this.organizationClient = organizationClient;
    }

    @Override
    @Transactional
    public DoctorAssignmentResponse createAssignment(Long doctorId, DoctorAssignmentRequest request) {
        log.info("Creating assignment for doctorId: {}, hospitalId: {}, departmentId: {}",
                doctorId, request.getHospitalId(), request.getDepartmentId());

        // 1. Doctor must exist
        if (!doctorRepository.existsById(doctorId)) {
            throw new DoctorNotFoundException("Doctor not found with id: " + doctorId);
        }

        // 2. Validate Hospital exists
        validateHospitalExists(request.getHospitalId());

        // 3. Validate Department exists and belongs to Hospital
        validateDepartmentBelongsToHospital(request.getHospitalId(), request.getDepartmentId());

        // 4. Duplicate check
        if (assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(
                doctorId, request.getHospitalId(), request.getDepartmentId())) {
            throw new DuplicateResourceException(
                    "Doctor " + doctorId + " is already assigned to hospital " +
                            request.getHospitalId() + " and department " + request.getDepartmentId());
        }

        DoctorHospitalAssignment assignment = new DoctorHospitalAssignment();
        assignment.setDoctorId(doctorId);
        assignment.setHospitalId(request.getHospitalId());
        assignment.setDepartmentId(request.getDepartmentId());
        assignment.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : null);
        assignment.setStatus(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE");
        
        if (request.getPublicAppointmentEnabled() != null) {
            assignment.setPublicAppointmentEnabled(request.getPublicAppointmentEnabled());
        }
        if (request.getInHouseClinicalEnabled() != null) {
            assignment.setInHouseClinicalEnabled(request.getInHouseClinicalEnabled());
        }

        DoctorHospitalAssignment saved = assignmentRepository.save(assignment);
        log.info("Successfully created assignment with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAssignmentResponse> getAssignmentsByDoctor(Long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new DoctorNotFoundException("Doctor not found with id: " + doctorId);
        }
        return assignmentRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAssignmentResponse> getAssignmentsByHospital(Long hospitalId, Long departmentId) {
        List<DoctorHospitalAssignment> list;
        if (departmentId != null) {
            list = assignmentRepository.findByHospitalIdAndDepartmentId(hospitalId, departmentId);
        } else {
            list = assignmentRepository.findByHospitalId(hospitalId);
        }
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        log.info("Deleting assignment with id: {}", assignmentId);
        DoctorHospitalAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with id: " + assignmentId));
        assignmentRepository.delete(assignment);
        log.info("Successfully deleted assignment with id: {}", assignmentId);
    }

    private void validateHospitalExists(Long hospitalId) {
        try {
            Map<String, Object> response = organizationClient.getHospitalById(hospitalId);
            if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                throw new IllegalArgumentException("Hospital not found with id: " + hospitalId);
            }
        } catch (FeignException.NotFound | FeignException.BadRequest e) {
            throw new IllegalArgumentException("Hospital not found with id: " + hospitalId);
        } catch (Exception e) {
            if (e instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) e;
            }
            log.error("Failed to verify hospital existence with organization-service: {}", e.getMessage());
            throw new RuntimeException("Could not verify hospital: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void validateDepartmentBelongsToHospital(Long hospitalId, Long departmentId) {
        try {
            Map<String, Object> response = organizationClient.getDepartmentById(departmentId);
            if (response == null || !Boolean.TRUE.equals(response.get("success"))) {
                throw new IllegalArgumentException("Department not found with id: " + departmentId);
            }
            Map<String, Object> deptData = (Map<String, Object>) response.get("data");
            if (deptData == null || deptData.get("hospitalId") == null) {
                throw new IllegalArgumentException("Invalid department data received");
            }
            Long deptHospitalId = Long.valueOf(deptData.get("hospitalId").toString());
            if (!deptHospitalId.equals(hospitalId)) {
                throw new InvalidHierarchyException(
                        "Department with id " + departmentId + " belongs to hospital " +
                                deptHospitalId + ", not hospital " + hospitalId);
            }
        } catch (FeignException.NotFound | FeignException.BadRequest e) {
            throw new IllegalArgumentException("Department not found with id: " + departmentId);
        } catch (Exception e) {
            if (e instanceof InvalidHierarchyException) {
                throw (InvalidHierarchyException) e;
            }
            if (e instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) e;
            }
            log.error("Failed to verify department existence with organization-service: {}", e.getMessage());
            throw new RuntimeException("Could not verify department: " + e.getMessage());
        }
    }

    private DoctorAssignmentResponse mapToResponse(DoctorHospitalAssignment assignment) {
        DoctorAssignmentResponse response = new DoctorAssignmentResponse();
        response.setId(assignment.getId());
        response.setDoctorId(assignment.getDoctorId());
        response.setHospitalId(assignment.getHospitalId());
        response.setDepartmentId(assignment.getDepartmentId());
        response.setDesignation(assignment.getDesignation());
        response.setStatus(assignment.getStatus());
        response.setPublicAppointmentEnabled(assignment.getPublicAppointmentEnabled());
        response.setInHouseClinicalEnabled(assignment.getInHouseClinicalEnabled());
        response.setCreatedAt(assignment.getCreatedAt());
        response.setUpdatedAt(assignment.getUpdatedAt());
        return response;
    }
}
