package com.swarnikacare.iam.service;

import com.swarnikacare.iam.dto.AuthResponse;
import com.swarnikacare.iam.dto.OtpVerifyRequest;
import com.swarnikacare.iam.dto.PatientRegistrationRequest;
import com.swarnikacare.iam.entity.OtpPurpose;
import com.swarnikacare.iam.entity.Role;
import com.swarnikacare.iam.entity.User;
import com.swarnikacare.iam.entity.UserStatus;
import com.swarnikacare.iam.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private OtpService otpService;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("test@example.com", Role.PATIENT, UserStatus.ACTIVE, false);
        testUser.setId(1L);
    }

    @Test
    void registerPatient_ShouldCreateUserAndSendOtp() {
        PatientRegistrationRequest request = new PatientRegistrationRequest();
        request.setEmail("test@example.com");

        when(userService.createPatient("test@example.com")).thenReturn(testUser);

        authService.registerPatient(request);

        verify(userService, times(1)).createPatient("test@example.com");
        verify(otpService, times(1)).generateAndSendOtp("test@example.com", OtpPurpose.REGISTRATION);
    }

    @Test
    void verifyOtp_Success() {
        OtpVerifyRequest request = new OtpVerifyRequest("test@example.com", "123456");
        
        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpService.verifyOtp("test@example.com", "123456", OtpPurpose.REGISTRATION)).thenReturn(true);
        when(jwtService.generateToken(testUser)).thenReturn("mock-jwt-token");

        AuthResponse response = authService.verifyOtp(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getToken());
        assertTrue(testUser.isEmailVerified());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void verifyOtp_InvalidOtp_ThrowsException() {
        OtpVerifyRequest request = new OtpVerifyRequest("test@example.com", "000000");
        
        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpService.verifyOtp("test@example.com", "000000", OtpPurpose.REGISTRATION)).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.verifyOtp(request));
    }

    @Test
    void verifyOtp_LockedAccount_ThrowsException() {
        testUser.setStatus(UserStatus.LOCKED);
        OtpVerifyRequest request = new OtpVerifyRequest("test@example.com", "123456");
        
        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpService.verifyOtp("test@example.com", "123456", OtpPurpose.REGISTRATION)).thenReturn(true);

        assertThrows(LockedException.class, () -> authService.verifyOtp(request));
    }

    @Test
    void verifyOtp_InactiveAccount_ThrowsException() {
        testUser.setStatus(UserStatus.INACTIVE);
        OtpVerifyRequest request = new OtpVerifyRequest("test@example.com", "123456");
        
        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(otpService.verifyOtp("test@example.com", "123456", OtpPurpose.REGISTRATION)).thenReturn(true);

        assertThrows(DisabledException.class, () -> authService.verifyOtp(request));
    }
}
