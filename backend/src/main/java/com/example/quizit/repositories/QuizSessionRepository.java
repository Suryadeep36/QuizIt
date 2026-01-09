package com.example.quizit.repositories;

import com.example.quizit.entities.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizSessionRepository extends JpaRepository<QuizSession, UUID> {
    boolean existsBySessionId(UUID sessionId);
    Optional<QuizSession> findBySessionId(UUID sessionId);

    QuizSession findQuizSessionBySessionId(UUID sessionId);
}
