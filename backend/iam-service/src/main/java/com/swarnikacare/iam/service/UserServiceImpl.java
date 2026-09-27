package com.swarnikacare.iam.service;

import com.swarnikacare.iam.entity.Role;
import com.swarnikacare.iam.entity.User;
import com.swarnikacare.iam.entity.UserStatus;
import com.swarnikacare.iam.dto.UserResponse;
import com.swarnikacare.iam.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public User createPatient(String email) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).get();
        }
        User user = new User(email, Role.PATIENT, UserStatus.ACTIVE, false);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User createDoctor(String email) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User u = existing.get();
            if (u.getStatus() == UserStatus.PENDING) {
                u.setStatus(UserStatus.ACTIVE);
                u.setEmailVerified(true);
                return userRepository.save(u);
            }
            throw new IllegalArgumentException("User with this email already exists");
        }
        User user = new User(email, Role.DOCTOR, UserStatus.ACTIVE, true);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User createSuperAdmin(String email) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).get(); // Return existing if bootstrap runs twice
        }
        User user = new User(email, Role.SUPER_ADMIN, UserStatus.ACTIVE, true); // Assume verified since it's bootstrap
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User createStaffUser(String email, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        User user = new User(email, role, UserStatus.ACTIVE, false);
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.findById(id).ifPresent(userRepository::delete);
    }

    @Override
    public UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getStatus().name()
        );
    }
}
