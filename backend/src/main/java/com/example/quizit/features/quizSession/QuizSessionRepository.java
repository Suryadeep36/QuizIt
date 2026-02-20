package com.example.quizit.features.quizSession;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuizSessionRepository extends JpaRepository<QuizSession, UUID> {
    boolean existsBySessionId(UUID sessionId);
    Optional<QuizSession> findBySessionId(UUID sessionId);
    QuizSession findQuizSessionBySessionId(UUID sessionId);

    boolean existsByJoinCode(String joinCode);
    Optional<QuizSession> findByJoinCode(String joinCode);

    QuizSession findByQuiz_QuizId(UUID quizQuizId);
}
