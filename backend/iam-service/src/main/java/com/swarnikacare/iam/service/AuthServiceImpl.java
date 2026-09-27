package com.swarnikacare.iam.service;

import com.swarnikacare.iam.dto.AuthResponse;
import com.swarnikacare.iam.dto.OtpRequest;
import com.swarnikacare.iam.dto.OtpVerifyRequest;
import com.swarnikacare.iam.dto.PatientRegistrationRequest;
import com.swarnikacare.iam.entity.OtpPurpose;
import com.swarnikacare.iam.entity.User;
import com.swarnikacare.iam.entity.UserStatus;
import com.swarnikacare.iam.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthServiceImpl(UserService userService, OtpService otpService, JwtService jwtService, UserRepository userRepository) {
        this.userService = userService;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void registerPatient(PatientRegistrationRequest request) {
        // Create user if they don't exist, or get existing
        User user = userService.createPatient(request.getEmail());
        
        // If email is already verified, this is effectively a login request
        OtpPurpose purpose = user.isEmailVerified() ? OtpPurpose.LOGIN : OtpPurpose.REGISTRATION;
        
        // Send OTP
        otpService.generateAndSendOtp(request.getEmail(), purpose);
    }

    @Override
    @Transactional
    public void requestOtp(OtpRequest request) {
        // We only send LOGIN OTP if user exists and is active. 
        // We don't throw exception to avoid leaking if email exists, 
        // but for now throwing standard exceptions or returning silent success is a choice.
        // Returning silent success is safer.
        User user = userService.findByEmail(request.getEmail()).orElse(null);
        if (user != null) {
            if (user.getStatus() == UserStatus.LOCKED || user.getStatus() == UserStatus.PENDING || user.getStatus() == UserStatus.INACTIVE) {
                // Return silently to avoid account enumeration
                return;
            }
            otpService.generateAndSendOtp(request.getEmail(), OtpPurpose.LOGIN);
        }
    }

    @Override
    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid authentication attempt"));

        // Determine if they were registering or logging in
        OtpPurpose purpose = user.isEmailVerified() ? OtpPurpose.LOGIN : OtpPurpose.REGISTRATION;

        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), purpose);
        if (!isValid) {
            throw new BadCredentialsException("Invalid or expired OTP");
        }

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new LockedException("Account is locked");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new DisabledException("Account is inactive");
        }
        if (user.getStatus() == UserStatus.PENDING) {
            throw new DisabledException("Account is pending verification/onboarding");
        }

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }
}
