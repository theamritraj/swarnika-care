package com.swarnikacare.appointment.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

public class CustomAuthenticationDetails extends WebAuthenticationDetails {
    private final Long hospitalId;
    private final Long userId;

    public CustomAuthenticationDetails(HttpServletRequest request, Long hospitalId, Long userId) {
        super(request);
        this.hospitalId = hospitalId;
        this.userId = userId;
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public Long getUserId() {
        return userId;
    }
}
