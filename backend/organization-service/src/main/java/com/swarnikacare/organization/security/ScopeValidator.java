package com.swarnikacare.organization.security;

import com.swarnikacare.organization.entity.Employee;
import com.swarnikacare.organization.repository.EmployeeRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("scopeValidator")
public class ScopeValidator {

    private final EmployeeRepository employeeRepository;

    public ScopeValidator(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public boolean canAccessHospital(Authentication authentication, Long hospitalId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin) {
            return true;
        }

        if (hospitalId == null) {
            return false;
        }

        boolean isHospitalAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_HOSPITAL_ADMIN"));

        if (isHospitalAdmin && authentication.getDetails() instanceof java.util.Map) {
            java.util.Map<?, ?> details = (java.util.Map<?, ?>) authentication.getDetails();
            Object scopedHId = details.get("hospitalId");
            if (scopedHId != null) {
                try {
                    Long userHospitalId = Long.valueOf(scopedHId.toString());
                    return userHospitalId.equals(hospitalId);
                } catch (NumberFormatException ignored) {}
            }
        }

        String userId = authentication.getName();
        Optional<Employee> empOpt = employeeRepository.findByUserId(userId);
        if (empOpt.isPresent()) {
            return empOpt.get().getHospitalId().equals(hospitalId);
        }

        return false;
    }
}
