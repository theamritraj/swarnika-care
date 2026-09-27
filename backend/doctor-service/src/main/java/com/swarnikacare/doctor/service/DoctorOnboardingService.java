package com.swarnikacare.doctor.service;

import com.swarnikacare.doctor.dto.DoctorOnboardingInitiateRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingCompleteRequest;
import com.swarnikacare.doctor.dto.DoctorOnboardingResponse;

public interface DoctorOnboardingService {
    String initiateOnboarding(DoctorOnboardingInitiateRequest request);
    DoctorOnboardingResponse completeOnboarding(DoctorOnboardingCompleteRequest request);
    String resendOnboardingOtp(String email);
}
