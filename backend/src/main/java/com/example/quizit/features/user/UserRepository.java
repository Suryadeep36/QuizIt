package com.example.quizit.features.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByemail(String email);

    Optional<User> findByEmail(String email);
    List<User> findAll();
    List<User> findAllByemail(String email);
    Optional<User> findById(UUID id);
}
