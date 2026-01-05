package com.example.quizit.repositories;

import com.example.quizit.dtos.UserDto;
import com.example.quizit.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByemail(String email);

    Optional<User> findByemail(String email);
    List<User> findAll();
    List<User> findAllByemail(String email);
    Optional<User> findById(UUID id);
}
