package com.sustainshare.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sustainshare.backend.model.User;
import com.sustainshare.backend.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        return userRepository.save(user);
    }

    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean isEmailTaken(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // New method to authenticate user by email and password
    public Optional<User> authenticateUser(String email, String password) {
        // Trim email and password to avoid whitespace issues
        String trimmedEmail = email != null ? email.trim() : null;
        String trimmedPassword = password != null ? password.trim() : null;

        Optional<User> userOpt = userRepository.findByEmail(trimmedEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // For now, plain text password comparison (consider hashing in future)
            if (user.getPassword() != null && user.getPassword().equals(trimmedPassword)) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public long getUserCount() {
        return userRepository.count();
    }
}
