package com.swarnikacare.iam.service;

import com.swarnikacare.iam.entity.OtpPurpose;

public interface OtpService {
    void generateAndSendOtp(String email, OtpPurpose purpose);
    boolean verifyOtp(String email, String otp, OtpPurpose purpose);
}
