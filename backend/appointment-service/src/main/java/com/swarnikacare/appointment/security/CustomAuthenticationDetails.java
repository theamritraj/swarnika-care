package com.swarnikacare.appointment.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

public class CustomAuthenticationDetails extends WebAuthenticationDetails {
    private final Long hospitalId;

    public CustomAuthenticationDetails(HttpServletRequest request, Long hospitalId) {
        super(request);
        this.hospitalId = hospitalId;
    }

    public Long getHospitalId() {
        return hospitalId;
    }
}
