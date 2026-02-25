package com.example.quizit.features.registeredUser;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RegisteredUserRepository extends JpaRepository<RegisteredUser, UUID> {

     public RegisteredUser save(RegisteredUser registeredUser);

     RegisteredUser findByAllowedUser_Id(UUID allowedUserId);
}
