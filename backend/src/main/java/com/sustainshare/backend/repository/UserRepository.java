package com.sustainshare.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sustainshare.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    //boolean existsByPhone(Long phone);
    Optional<User> findByEmail(String email);
}
