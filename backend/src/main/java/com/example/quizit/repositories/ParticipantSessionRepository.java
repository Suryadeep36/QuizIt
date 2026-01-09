package com.example.quizit.repositories;

import com.example.quizit.entities.Participant;
import com.example.quizit.entities.ParticipantSession;
import com.example.quizit.entities.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParticipantSessionRepository extends JpaRepository<ParticipantSession, UUID> {
    boolean existsByQuizSessionAndParticipant(QuizSession quizSession, Participant participant);
    List<ParticipantSession> getParticipantSessionByQuizSession_SessionId(UUID quizSessionSessionId);
}
