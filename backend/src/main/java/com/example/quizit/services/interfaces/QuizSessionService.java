package com.example.quizit.services.interfaces;

import com.example.quizit.dtos.HostReconnectResponse;
import com.example.quizit.dtos.ParticipantJoinedMessageDto;
import com.example.quizit.dtos.QuestionForUserDto;
import com.example.quizit.dtos.QuizSessionDto;

import java.util.Map;
import java.util.UUID;

public interface QuizSessionService {
    QuizSessionDto createQuizSession(UUID quizId, UUID hostId);
    QuestionForUserDto startQuiz(UUID sessionId);
    QuestionForUserDto moveToNextQuestion(UUID sessionId);
    QuizSessionDto endQuiz(UUID sessionId);
    ParticipantJoinedMessageDto joinSession(UUID sessionId, UUID userId);
    HostReconnectResponse getHostReconnectState(UUID sessionId);
    Map<String, Object> revealAnswer(UUID sessionId);
    UUID getQuizIdBySessionId(UUID sessionId);
}
