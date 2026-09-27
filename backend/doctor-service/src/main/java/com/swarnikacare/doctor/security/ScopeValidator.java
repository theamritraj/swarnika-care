package com.swarnikacare.doctor.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component("scopeValidator")
public class ScopeValidator {

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

        if (isHospitalAdmin && authentication.getDetails() instanceof Map) {
            Map<?, ?> details = (Map<?, ?>) authentication.getDetails();
            Object scopedHId = details.get("hospitalId");
            if (scopedHId != null) {
                try {
                    Long userHospitalId = Long.valueOf(scopedHId.toString());
                    return userHospitalId.equals(hospitalId);
                } catch (NumberFormatException e) {
                    return false;
                }
            }
        }

        return false;
    }
}
