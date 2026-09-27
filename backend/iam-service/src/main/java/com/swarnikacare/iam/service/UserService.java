package com.swarnikacare.iam.service;

import com.swarnikacare.iam.entity.User;
import com.swarnikacare.iam.dto.UserResponse;
import java.util.Optional;

public interface UserService {
    User createPatient(String email);
    User createDoctor(String email);
    User createSuperAdmin(String email);
    User createStaffUser(String email, com.swarnikacare.iam.entity.Role role);
    Optional<User> findByEmail(String email);
    Optional<User> findById(Long id);
    void deleteUser(Long id);
    UserResponse mapToResponse(User user);
}
