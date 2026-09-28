package com.swarnikacare.iam.service;

import com.swarnikacare.iam.dto.AuthResponse;
import com.swarnikacare.iam.dto.OtpRequest;
import com.swarnikacare.iam.dto.OtpVerifyRequest;
import com.swarnikacare.iam.dto.PatientRegistrationRequest;

public interface AuthService {
    void registerPatient(PatientRegistrationRequest request);
    void requestOtp(OtpRequest request);
    AuthResponse verifyOtp(OtpVerifyRequest request);
}
