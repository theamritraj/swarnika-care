package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.OrganizationClient;
import com.swarnikacare.doctor.dto.DoctorAvailabilityRequest;
import com.swarnikacare.doctor.dto.DoctorAvailabilityResponse;
import com.swarnikacare.doctor.entity.DoctorAvailability;
import com.swarnikacare.doctor.exception.DoctorNotFoundException;
import com.swarnikacare.doctor.exception.InvalidHierarchyException;
import com.swarnikacare.doctor.repository.DoctorAvailabilityRepository;
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
public class DoctorAvailabilityServiceImpl implements DoctorAvailabilityService {

    private static final Logger log = LoggerFactory.getLogger(DoctorAvailabilityServiceImpl.class);

    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorHospitalAssignmentRepository assignmentRepository;
    private final OrganizationClient organizationClient;

    public DoctorAvailabilityServiceImpl(
            DoctorAvailabilityRepository availabilityRepository,
            DoctorRepository doctorRepository,
            DoctorHospitalAssignmentRepository assignmentRepository,
            OrganizationClient organizationClient) {
        this.availabilityRepository = availabilityRepository;
        this.doctorRepository = doctorRepository;
        this.assignmentRepository = assignmentRepository;
        this.organizationClient = organizationClient;
    }

    @Override
    @Transactional
    public DoctorAvailabilityResponse addAvailability(Long doctorId, DoctorAvailabilityRequest request) {
        log.info("Adding availability for doctor id: {}, hospital: {}, dept: {}",
                doctorId, request.getHospitalId(), request.getDepartmentId());

        // 1. Doctor must exist
        if (!doctorRepository.existsById(doctorId)) {
            throw new DoctorNotFoundException("Doctor not found with id: " + doctorId);
        }

        // 2. Validate Hospital exists
        validateHospitalExists(request.getHospitalId());

        // 3. Validate Department belongs to Hospital
        validateDepartmentBelongsToHospital(request.getHospitalId(), request.getDepartmentId());

        // 4. Doctor must be assigned to hospital
        if (!assignmentRepository.existsByDoctorIdAndHospitalId(doctorId, request.getHospitalId())) {
            throw new IllegalArgumentException("Doctor is not assigned to hospital " + request.getHospitalId());
        }

        // 5. Doctor must be assigned to department
        if (!assignmentRepository.existsByDoctorIdAndHospitalIdAndDepartmentId(
                doctorId, request.getHospitalId(), request.getDepartmentId())) {
            throw new IllegalArgumentException("Doctor is not assigned to department " +
                    request.getDepartmentId() + " in hospital " + request.getHospitalId());
        }

        // 6. Start time must be before end time
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // 7. Check for overlapping slots on the same day for this doctor
        List<DoctorAvailability> overlapping = availabilityRepository.findOverlappingSlots(
                doctorId, request.getDayOfWeek(), request.getStartTime(), request.getEndTime(), null);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Doctor has overlapping availability slot on " +
                    request.getDayOfWeek() + " between " + request.getStartTime() + " and " + request.getEndTime());
        }

        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctorId(doctorId);
        availability.setHospitalId(request.getHospitalId());
        availability.setDepartmentId(request.getDepartmentId());
        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());
        availability.setIsActive(true);

        DoctorAvailability saved = availabilityRepository.save(availability);
        log.info("Successfully added availability with id: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponse> getAvailabilityByDoctor(Long doctorId) {
        log.info("Fetching availability for doctor id: {}", doctorId);
        if (!doctorRepository.existsById(doctorId)) {
            throw new DoctorNotFoundException("Doctor not found with id: " + doctorId);
        }

        return availabilityRepository.findByDoctorId(doctorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorAvailabilityResponse> getAvailability(Long hospitalId, Long departmentId, Long doctorId) {
        log.info("Fetching availability with filters hospitalId: {}, departmentId: {}, doctorId: {}",
                hospitalId, departmentId, doctorId);

        List<DoctorAvailability> list;
        if (doctorId != null && hospitalId != null && departmentId != null) {
            list = availabilityRepository.findByDoctorIdAndHospitalIdAndDepartmentId(doctorId, hospitalId, departmentId);
        } else if (doctorId != null && hospitalId != null) {
            list = availabilityRepository.findByDoctorIdAndHospitalId(doctorId, hospitalId);
        } else if (doctorId != null) {
            list = availabilityRepository.findByDoctorId(doctorId);
        } else if (hospitalId != null && departmentId != null) {
            list = availabilityRepository.findByHospitalIdAndDepartmentId(hospitalId, departmentId);
        } else if (hospitalId != null) {
            list = availabilityRepository.findByHospitalId(hospitalId);
        } else if (departmentId != null) {
            list = availabilityRepository.findByDepartmentId(departmentId);
        } else {
            list = availabilityRepository.findAll();
        }

        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAvailability(Long id) {
        log.info("Deleting availability id: {}", id);
        DoctorAvailability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with id: " + id));
        availabilityRepository.delete(availability);
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

    private DoctorAvailabilityResponse mapToResponse(DoctorAvailability availability) {
        DoctorAvailabilityResponse response = new DoctorAvailabilityResponse();
        response.setId(availability.getId());
        response.setDoctorId(availability.getDoctorId());
        response.setHospitalId(availability.getHospitalId());
        response.setDepartmentId(availability.getDepartmentId());
        response.setDayOfWeek(availability.getDayOfWeek());
        response.setStartTime(availability.getStartTime());
        response.setEndTime(availability.getEndTime());
        response.setIsActive(availability.getIsActive());
        return response;
    }
}
