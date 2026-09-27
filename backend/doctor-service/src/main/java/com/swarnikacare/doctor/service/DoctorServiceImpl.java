package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.DoctorProvisionRequest;
import com.swarnikacare.doctor.client.IamClient;
import com.swarnikacare.doctor.client.UserResponse;
import com.swarnikacare.doctor.dto.DoctorAssignmentResponse;
import com.swarnikacare.doctor.dto.DoctorCreateRequest;
import com.swarnikacare.doctor.dto.DoctorDirectoryResponse;
import com.swarnikacare.doctor.dto.DoctorResponse;
import com.swarnikacare.doctor.dto.DoctorUpdateRequest;
import com.swarnikacare.doctor.entity.Doctor;
import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import com.swarnikacare.doctor.exception.DoctorNotFoundException;
import com.swarnikacare.doctor.exception.DuplicateResourceException;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.repository.DoctorProfileRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorServiceImpl.class);

    private final DoctorRepository doctorRepository;
    private final IamClient iamClient;
    private final DoctorProfileRepository profileRepository;
    private final DoctorHospitalAssignmentRepository assignmentRepository;

    public DoctorServiceImpl(
            DoctorRepository doctorRepository,
            IamClient iamClient,
            DoctorProfileRepository profileRepository,
            DoctorHospitalAssignmentRepository assignmentRepository) {
        this.doctorRepository = doctorRepository;
        this.iamClient = iamClient;
        this.profileRepository = profileRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Override
    @Transactional
    public DoctorResponse createDoctor(DoctorCreateRequest request) {
        log.info("Creating new doctor with email: {}", request.getEmail());
        
        // Step 1: Provision IAM user
        UserResponse iamUser;
        try {
            iamUser = iamClient.provisionDoctor(new DoctorProvisionRequest(request.getEmail()));
            log.info("Provisioned IAM user with id: {}", iamUser.getId());
        } catch (feign.FeignException e) {
            log.error("Failed to provision IAM user: status={}, message={}", e.status(), e.getMessage());
            String responseBody = e.contentUTF8();
            if (responseBody != null && responseBody.contains("already exists")) {
                throw new DuplicateResourceException("A user or doctor with email '" + request.getEmail() + "' already exists.");
            }
            if (e.status() == 400 || e.status() == 409) {
                throw new DuplicateResourceException("User with email '" + request.getEmail() + "' is already registered in the system.");
            }
            throw new RuntimeException("Identity service error. Please try again later.");
        } catch (Exception e) {
            log.error("Failed to provision IAM user", e);
            throw new RuntimeException("Failed to provision doctor identity: " + (e.getMessage() != null && !e.getMessage().contains("http") ? e.getMessage() : "Please verify credentials and try again."));
        }

        Doctor doctor = new Doctor();
        doctor.setUserId(String.valueOf(iamUser.getId())); 
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setEmail(request.getEmail());
        doctor.setPhone(request.getPhone());
        doctor.setGender(request.getGender());
        doctor.setDateOfBirth(request.getDateOfBirth());
        doctor.setStatus("ACTIVE");
        
        try {
            Doctor savedDoctor = doctorRepository.save(doctor);
            log.info("Successfully created doctor with id: {}", savedDoctor.getId());
            return mapToResponse(savedDoctor);
        } catch (Exception e) {
            log.error("Failed to save doctor. Rolling back IAM user...", e);
            iamClient.deleteUser(iamUser.getId());
            throw new RuntimeException("Failed to save doctor. Rollback completed: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorByUserId(String userId) {
        String cleanId = userId != null && userId.startsWith("usr-") ? userId.substring(4) : userId;
        Doctor doctor = doctorRepository.findByUserId(userId)
                .or(() -> doctorRepository.findByUserId(cleanId))
                .or(() -> doctorRepository.findByEmail(userId))
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with user id: " + userId));
        return mapToResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        log.info("Fetching doctor by id: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Doctor not found with id: {}", id);
                    return new DoctorNotFoundException("Doctor not found with id: " + id);
                });
        return mapToResponse(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors() {
        log.info("Fetching all doctors");
        return doctorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorDirectoryResponse> getDoctorDirectory(Long hospitalId, Long departmentId, String search) {
        log.info("Fetching doctor directory with filters hospitalId: {}, departmentId: {}, search: {}",
                hospitalId, departmentId, search);

        List<Doctor> doctors;
        if (hospitalId != null && departmentId != null) {
            List<DoctorHospitalAssignment> assignments = assignmentRepository.findByHospitalIdAndDepartmentId(hospitalId, departmentId);
            List<Long> docIds = assignments.stream().map(DoctorHospitalAssignment::getDoctorId).distinct().collect(Collectors.toList());
            doctors = doctorRepository.findAllById(docIds);
        } else if (hospitalId != null) {
            List<DoctorHospitalAssignment> assignments = assignmentRepository.findByHospitalId(hospitalId);
            List<Long> docIds = assignments.stream().map(DoctorHospitalAssignment::getDoctorId).distinct().collect(Collectors.toList());
            doctors = doctorRepository.findAllById(docIds);
        } else {
            doctors = doctorRepository.findAll();
        }

        if (search != null && !search.trim().isEmpty()) {
            String query = search.trim().toLowerCase();
            doctors = doctors.stream().filter(d ->
                    (d.getFirstName() != null && d.getFirstName().toLowerCase().contains(query)) ||
                    (d.getLastName() != null && d.getLastName().toLowerCase().contains(query)) ||
                    (d.getEmail() != null && d.getEmail().toLowerCase().contains(query))
            ).collect(Collectors.toList());
        }

        return doctors.stream().map(this::mapToDirectoryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorUpdateRequest request) {
        log.info("Updating doctor with id: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Doctor not found for update with id: {}", id);
                    return new DoctorNotFoundException("Doctor not found with id: " + id);
                });
                
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setEmail(request.getEmail());
        doctor.setPhone(request.getPhone());
        doctor.setGender(request.getGender());
        doctor.setDateOfBirth(request.getDateOfBirth());
        doctor.setStatus(request.getStatus() != null ? request.getStatus() : doctor.getStatus());
        
        Doctor updatedDoctor = doctorRepository.save(doctor);
        log.info("Successfully updated doctor with id: {}", id);
        
        return mapToResponse(updatedDoctor);
    }

    @Override
    @Transactional
    public void deleteDoctor(Long id) {
        log.info("Deleting doctor with id: {}", id);
        if (!doctorRepository.existsById(id)) {
            log.error("Doctor not found for deletion with id: {}", id);
            throw new DoctorNotFoundException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
        log.info("Successfully deleted doctor with id: {}", id);
    }
    
    private DoctorResponse mapToResponse(Doctor doctor) {
        DoctorResponse response = new DoctorResponse();
        response.setId(doctor.getId());
        response.setUserId(doctor.getUserId());
        response.setFirstName(doctor.getFirstName());
        response.setLastName(doctor.getLastName());
        response.setEmail(doctor.getEmail());
        response.setPhone(doctor.getPhone());
        response.setGender(doctor.getGender());
        response.setDateOfBirth(doctor.getDateOfBirth());
        response.setStatus(doctor.getStatus());
        return response;
    }

    private DoctorDirectoryResponse mapToDirectoryResponse(Doctor doctor) {
        DoctorDirectoryResponse resp = new DoctorDirectoryResponse();
        resp.setId(doctor.getId());
        resp.setUserId(doctor.getUserId());
        resp.setFirstName(doctor.getFirstName());
        resp.setLastName(doctor.getLastName());
        resp.setEmail(doctor.getEmail());
        resp.setPhone(doctor.getPhone());
        resp.setGender(doctor.getGender());
        resp.setDateOfBirth(doctor.getDateOfBirth());
        resp.setStatus(doctor.getStatus());

        // Profile summary
        profileRepository.findByDoctorId(doctor.getId()).ifPresent(profile -> {
            resp.setBio(profile.getBio());
            resp.setQualifications(profile.getQualifications());
            resp.setSpecialization(profile.getSpecializations());
            resp.setRegistrationNumber(profile.getRegistrationNumber());
            resp.setExperienceYears(profile.getExperienceYears());
            resp.setProfilePictureUrl(profile.getProfilePictureUrl());
            resp.setDefaultConsultationFee(profile.getDefaultConsultationFee());
            resp.setProfileStatus(profile.getStatus() != null ? profile.getStatus().name() : "DRAFT");
        });

        // Hospital assignments
        List<DoctorAssignmentResponse> assignmentResponses = assignmentRepository.findByDoctorId(doctor.getId()).stream()
                .map(a -> {
                    DoctorAssignmentResponse ar = new DoctorAssignmentResponse();
                    ar.setId(a.getId());
                    ar.setDoctorId(a.getDoctorId());
                    ar.setHospitalId(a.getHospitalId());
                    ar.setDepartmentId(a.getDepartmentId());
                    ar.setDesignation(a.getDesignation());
                    ar.setStatus(a.getStatus());
                    ar.setPublicAppointmentEnabled(a.getPublicAppointmentEnabled());
                    ar.setInHouseClinicalEnabled(a.getInHouseClinicalEnabled());
                    ar.setCreatedAt(a.getCreatedAt());
                    ar.setUpdatedAt(a.getUpdatedAt());
                    return ar;
                }).collect(Collectors.toList());
        resp.setAssignments(assignmentResponses);

        return resp;
    }
}
