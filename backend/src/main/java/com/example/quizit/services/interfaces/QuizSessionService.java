package com.example.quizit.services.interfaces;

import com.example.quizit.dtos.QuizSessionDto;

import java.util.UUID;

public interface QuizSessionService {
    QuizSessionDto createQuizSession(UUID quizId, UUID hostId);
    QuizSessionDto findQuizSessionBySessionId(UUID sessionId);
    QuizSessionDto startQuiz(UUID sessionId);
    QuizSessionDto moveToNextQuestion(UUID sessionId);
    QuizSessionDto endQuiz(UUID sessionId);
    QuizSessionDto joinSession(UUID sessionId, UUID userId);
}
