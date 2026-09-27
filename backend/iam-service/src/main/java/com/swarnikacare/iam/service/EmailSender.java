package com.swarnikacare.iam.service;

public interface EmailSender {
    void sendOtp(String to, String otp, String purpose);
}
