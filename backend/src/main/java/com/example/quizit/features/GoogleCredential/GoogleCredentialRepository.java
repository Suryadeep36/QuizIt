package com.example.quizit.features.GoogleCredential;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GoogleCredentialRepository extends JpaRepository<GoogleCredential, UUID> {
    @Override
    GoogleCredential save(GoogleCredential googleCredential);
    Optional<GoogleCredential> findByUserId(UUID userId);

}
