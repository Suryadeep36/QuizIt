package com.example.quizit.features.participantSession;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.quizSession.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParticipantSessionRepository extends JpaRepository<ParticipantSession, UUID> {
    boolean existsByQuizSessionAndParticipant(QuizSession quizSession, Participant participant);
    List<ParticipantSession> getParticipantSessionByQuizSession_SessionId(UUID quizSessionSessionId);
}
