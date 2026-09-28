package com.swarnikacare.patient.security;

import com.swarnikacare.patient.entity.Patient;
import com.swarnikacare.patient.repository.PatientHospitalRegistrationRepository;
import com.swarnikacare.patient.repository.PatientRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component("scopeValidator")
public class ScopeValidator {

    private final PatientRepository patientRepository;
    private final PatientHospitalRegistrationRepository registrationRepository;

    public ScopeValidator(PatientRepository patientRepository, PatientHospitalRegistrationRepository registrationRepository) {
        this.patientRepository = patientRepository;
        this.registrationRepository = registrationRepository;
    }

    public boolean canAccessHospital(Authentication authentication, Long hospitalId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        if (hasRole(authentication, "ROLE_SUPER_ADMIN")) {
            return true;
        }

        if (hospitalId == null) {
            return false;
        }

        Long userHospitalId = extractUserHospitalId(authentication);
        if (userHospitalId != null) {
            return hospitalId.equals(userHospitalId);
        }
        return hasRole(authentication, "ROLE_HOSPITAL_ADMIN") || hasRole(authentication, "ROLE_RECEPTIONIST") || hasRole(authentication, "ROLE_DOCTOR") || hasRole(authentication, "ROLE_NURSE");
    }

    public boolean canAccessPatient(Authentication authentication, Long patientId) {
        if (authentication == null || !authentication.isAuthenticated() || patientId == null) {
            return false;
        }

        if (hasRole(authentication, "ROLE_SUPER_ADMIN")) {
            return true;
        }

        // If patient, check user ownership
        if (hasRole(authentication, "ROLE_PATIENT")) {
            String userId = authentication.getName();
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            return patientOpt.isPresent() && userId.equals(patientOpt.get().getUserId());
        }

        // If staff (Hospital Admin, Receptionist, Doctor, Nurse), check hospital scoping
        Long userHospitalId = extractUserHospitalId(authentication);
        if (userHospitalId != null) {
            return registrationRepository.existsByPatientIdAndHospitalId(patientId, userHospitalId);
        }

        return hasRole(authentication, "ROLE_HOSPITAL_ADMIN") || hasRole(authentication, "ROLE_RECEPTIONIST") || hasRole(authentication, "ROLE_DOCTOR") || hasRole(authentication, "ROLE_NURSE");
    }

    private Long extractUserHospitalId(Authentication authentication) {
        if (authentication != null && authentication.getDetails() instanceof Map) {
            Map<?, ?> details = (Map<?, ?>) authentication.getDetails();
            Object scopedHId = details.get("hospitalId");
            if (scopedHId != null) {
                try {
                    return Long.valueOf(scopedHId.toString());
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals(role));
    }
}
