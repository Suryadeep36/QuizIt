package com.example.quizit.features.participant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ParticipantRepository extends JpaRepository<Participant, UUID> {

    List<Participant> findAllByQuiz_QuizId(UUID quizQuizId);

    List<Participant> findAllByUser_Id(UUID userId);
    
    List<Participant> findParticipantByQuiz_QuizIdAndUser_Id(UUID quizQuizId, UUID userId);
}
