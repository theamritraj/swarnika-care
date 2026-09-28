package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.client.*;
import com.swarnikacare.doctor.dto.DoctorOnboardingCompleteRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingInitiateRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingResponse;
import com.swarnikacare.doctor.entity.Doctor;
import com.swarnikacare.doctor.entity.DoctorHospitalAssignment;
import com.swarnikacare.doctor.entity.DoctorProfile;
import com.swarnikacare.doctor.exception.DuplicateResourceException;
import com.swarnikacare.doctor.repository.DoctorHospitalAssignmentRepository;
import com.swarnikacare.doctor.repository.DoctorProfileRepository;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class DoctorOnboardingServiceImpl implements DoctorOnboardingService {

    private static final Logger log = LoggerFactory.getLogger(DoctorOnboardingServiceImpl.class);

    private final DoctorRepository doctorRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorHospitalAssignmentRepository doctorHospitalAssignmentRepository;
    private final IamClient iamClient;
    private final OrganizationClient organizationClient;
    private final NotificationClient notificationClient;

    public DoctorOnboardingServiceImpl(DoctorRepository doctorRepository,
                                       DoctorProfileRepository doctorProfileRepository,
                                       DoctorHospitalAssignmentRepository doctorHospitalAssignmentRepository,
                                       IamClient iamClient,
                                       OrganizationClient organizationClient,
                                       NotificationClient notificationClient) {
        this.doctorRepository = doctorRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.doctorHospitalAssignmentRepository = doctorHospitalAssignmentRepository;
        this.iamClient = iamClient;
        this.organizationClient = organizationClient;
        this.notificationClient = notificationClient;
    }

    @Override
    public String initiateOnboarding(DoctorOnboardingInitiateRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Initiating doctor onboarding for email: {}", email);

        if (doctorRepository.findByEmail(email).isPresent()) {
            throw new DuplicateResourceException("A doctor with email '" + email + "' already exists.");
        }

        // Validate hospital & department if provided
        if (request.getHospitalId() != null && organizationClient != null) {
            try {
                organizationClient.getHospitalById(request.getHospitalId());
            } catch (Exception e) {
                log.warn("Could not verify hospital ID: {}", request.getHospitalId());
            }
        }

        if (request.getDepartmentId() != null && organizationClient != null) {
            try {
                organizationClient.getDepartmentById(request.getDepartmentId());
            } catch (Exception e) {
                log.warn("Could not verify department ID: {}", request.getDepartmentId());
            }
        }

        // Send OTP via IAM
        try {
            iamClient.sendVerificationOtp(new SendVerificationOtpRequest(email, "DOCTOR_ONBOARDING"));
            log.info("Successfully requested IAM verification OTP for doctor: {}", email);
            return "Verification code sent to " + email;
        } catch (feign.FeignException e) {
            String content = e.contentUTF8();
            if (content != null && content.contains("already exists")) {
                throw new DuplicateResourceException("A user or doctor with email '" + email + "' already exists.");
            }
            if (e.status() == 400 || e.status() == 409) {
                throw new DuplicateResourceException("An account with email '" + email + "' already exists.");
            }
            log.error("Failed to request verification code from IAM", e);
            throw new RuntimeException("Identity service error. Please try again.");
        } catch (Exception e) {
            log.error("Unexpected error contacting IAM for OTP", e);
            throw new RuntimeException("Unable to send verification code. Please try again.");
        }
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public DoctorOnboardingResponse completeOnboarding(DoctorOnboardingCompleteRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String otp = request.getOtp().trim();
        log.info("Completing doctor onboarding for email: {}", email);

        if (doctorRepository.findByEmail(email).isPresent()) {
            throw new DuplicateResourceException("A doctor with email '" + email + "' already exists.");
        }

        // Step 1: Verify OTP with IAM
        try {
            Map<String, Object> verifyResp = iamClient.verifyOtp(new VerifyOtpInternalRequest(email, otp, "DOCTOR_ONBOARDING"));
            Object validObj = verifyResp != null ? verifyResp.get("valid") : null;
            boolean isValid = Boolean.TRUE.equals(validObj) || "true".equalsIgnoreCase(String.valueOf(validObj));
            if (!isValid) {
                throw new IllegalArgumentException("Invalid verification code.");
            }
        } catch (feign.FeignException e) {
            log.error("IAM verify-otp returned error: status={}, body={}", e.status(), e.contentUTF8());
            throw new IllegalArgumentException("Invalid or expired verification code.");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to verify OTP with IAM", e);
            throw new RuntimeException("Verification service error: " + e.getMessage());
        }

        // Step 2: Provision IAM User (Upgrades to ACTIVE and emailVerified = true)
        UserResponse iamUser;
        try {
            iamUser = iamClient.provisionDoctor(new DoctorProvisionRequest(email));
            log.info("Provisioned IAM user id: {}", iamUser.getId());
        } catch (Exception e) {
            log.error("Failed to provision IAM user for doctor", e);
            throw new RuntimeException("Failed to activate user identity in IAM.");
        }

        // Step 3: Create Doctor Entity in doctor_db
        Doctor doctor = new Doctor();
        doctor.setUserId(String.valueOf(iamUser.getId()));
        doctor.setFirstName(request.getFirstName().trim());
        doctor.setLastName(request.getLastName().trim());
        doctor.setEmail(email);
        doctor.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        doctor.setGender(request.getGender());
        doctor.setDateOfBirth(request.getDateOfBirth());
        doctor.setStatus("ACTIVE");

        Doctor savedDoctor;
        try {
            savedDoctor = doctorRepository.save(doctor);
            log.info("Saved Doctor entity id: {}", savedDoctor.getId());
        } catch (Exception e) {
            log.error("Failed to save Doctor entity. Rolling back IAM user {}...", iamUser.getId(), e);
            iamClient.deleteUser(iamUser.getId());
            throw new RuntimeException("Failed to save doctor record. Identity rolled back.");
        }

        // Step 4: Create Profile (if details provided)
        try {
            DoctorProfile profile = new DoctorProfile();
            profile.setDoctorId(savedDoctor.getId());
            profile.setSpecializations(request.getSpecialization());
            profile.setQualifications(request.getQualifications());
            profile.setExperienceYears(request.getExperienceYears());
            profile.setRegistrationNumber(request.getRegistrationNumber());
            profile.setDefaultConsultationFee(request.getDefaultConsultationFee() != null ? request.getDefaultConsultationFee().doubleValue() : null);
            profile.setBio(request.getBio());
            doctorProfileRepository.save(profile);
            log.info("Saved DoctorProfile for doctorId: {}", savedDoctor.getId());
        } catch (Exception e) {
            log.warn("Failed to save DoctorProfile for doctorId: {}. Continuing with core record.", savedDoctor.getId(), e);
        }

        // Step 5: Create Hospital Assignment (if selected)
        String hospitalName = "Swarnika Hospitals";
        String departmentName = "Clinical Services";

        if (request.getHospitalId() != null && request.getDepartmentId() != null) {
            try {
                DoctorHospitalAssignment assignment = new DoctorHospitalAssignment();
                assignment.setDoctorId(savedDoctor.getId());
                assignment.setHospitalId(request.getHospitalId());
                assignment.setDepartmentId(request.getDepartmentId());
                assignment.setDesignation(request.getDesignation() != null ? request.getDesignation().trim() : "Consultant");
                assignment.setStatus("ACTIVE");
                assignment.setPublicAppointmentEnabled(Boolean.TRUE.equals(request.getPublicAppointmentEnabled()));
                assignment.setInHouseClinicalEnabled(Boolean.TRUE.equals(request.getInHouseClinicalEnabled()));
                doctorHospitalAssignmentRepository.save(assignment);
                log.info("Saved DoctorHospitalAssignment for doctorId: {}", savedDoctor.getId());

                // Fetch names from organizationClient for welcome email if available
                if (organizationClient != null) {
                    try {
                        Map<String, Object> hResp = organizationClient.getHospitalById(request.getHospitalId());
                        if (hResp != null && hResp.containsKey("name")) hospitalName = String.valueOf(hResp.get("name"));
                        else if (hResp != null && hResp.containsKey("data")) {
                            Map<String, Object> data = (Map<String, Object>) hResp.get("data");
                            if (data != null && data.containsKey("name")) hospitalName = String.valueOf(data.get("name"));
                        }
                    } catch (Exception ignored) {}

                    try {
                        Map<String, Object> dResp = organizationClient.getDepartmentById(request.getDepartmentId());
                        if (dResp != null && dResp.containsKey("name")) departmentName = String.valueOf(dResp.get("name"));
                        else if (dResp != null && dResp.containsKey("data")) {
                            Map<String, Object> data = (Map<String, Object>) dResp.get("data");
                            if (data != null && data.containsKey("name")) departmentName = String.valueOf(data.get("name"));
                        }
                    } catch (Exception ignored) {}
                }

            } catch (Exception e) {
                log.warn("Failed to save DoctorHospitalAssignment for doctorId: {}. Assignment can be added later.", savedDoctor.getId(), e);
            }
        }

        // Step 6: Dispatch Welcome Email via Notification Service (Failure Isolated)
        String welcomeEmailStatus = "QUEUED";
        if (notificationClient != null) {
            try {
                String eventId = UUID.randomUUID().toString();
                String doctorFullName = savedDoctor.getFirstName() + " " + savedDoctor.getLastName();
                String engagement = (Boolean.TRUE.equals(request.getPublicAppointmentEnabled()) ? "Public Appointments" : "") +
                        (Boolean.TRUE.equals(request.getPublicAppointmentEnabled()) && Boolean.TRUE.equals(request.getInHouseClinicalEnabled()) ? " + " : "") +
                        (Boolean.TRUE.equals(request.getInHouseClinicalEnabled()) ? "In-House Clinical" : "");

                DoctorWelcomeNotificationRequest welcomeReq = new DoctorWelcomeNotificationRequest(
                        eventId,
                        doctorFullName,
                        savedDoctor.getEmail(),
                        hospitalName,
                        departmentName,
                        request.getDesignation() != null ? request.getDesignation() : "Consultant",
                        "http://localhost:3001/login",
                        engagement.isEmpty() ? "In-House Clinical" : engagement
                );

                notificationClient.sendDoctorWelcome(welcomeReq);
                welcomeEmailStatus = "SENT";
                log.info("✅ Welcome email dispatched for newly onboarded doctor: {}", savedDoctor.getEmail());
            } catch (Exception e) {
                log.warn("⚠️ Notification service temporarily unavailable. Doctor created successfully; welcome email marked QUEUED: {}", e.getMessage());
                welcomeEmailStatus = "QUEUED";
            }
        }

        // Step 7: Build and return response
        DoctorOnboardingResponse response = new DoctorOnboardingResponse();
        response.setDoctorId(savedDoctor.getId());
        response.setDoctorName("Dr. " + savedDoctor.getFirstName() + " " + savedDoctor.getLastName());
        response.setEmail(savedDoctor.getEmail());
        response.setHospitalName(hospitalName);
        response.setDepartmentName(departmentName);
        response.setDesignation(request.getDesignation() != null ? request.getDesignation() : "Consultant");
        response.setWelcomeEmailStatus(welcomeEmailStatus);
        response.setMessage("Doctor onboarded successfully.");

        return response;
    }

    @Override
    public String resendOnboardingOtp(String email) {
        String cleanEmail = email.trim().toLowerCase();
        log.info("Resending doctor onboarding OTP to: {}", cleanEmail);

        if (doctorRepository.findByEmail(cleanEmail).isPresent()) {
            throw new DuplicateResourceException("A doctor with email '" + cleanEmail + "' already exists.");
        }

        try {
            iamClient.sendVerificationOtp(new SendVerificationOtpRequest(cleanEmail, "DOCTOR_ONBOARDING"));
            return "Verification code resent to " + cleanEmail;
        } catch (feign.FeignException e) {
            String content = e.contentUTF8();
            if (content != null && content.contains("wait before requesting")) {
                throw new IllegalStateException("Please wait before requesting another verification code.");
            }
            throw new RuntimeException("Failed to resend code: " + e.getMessage());
        }
    }
}
