package com.example.quizit.features.quizSession;

import com.example.quizit.dtos.HostReconnectResponse;
import com.example.quizit.dtos.ParticipantJoinedMessageDto;
import com.example.quizit.dtos.ParticipantReconnectResponse;
import com.example.quizit.dtos.QuestionDetailResponse;
import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.question.AnswerKey;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface QuizSessionService {
    QuizSessionDto createQuizSession(UUID quizId, UUID hostId);
    QuestionDetailResponse startQuiz(UUID sessionId, UUID hostId);
    QuestionDetailResponse moveToNextQuestion(UUID sessionId, UUID hostId);
    QuizSessionDto endQuiz(UUID sessionId, UUID hostId);
    ParticipantJoinedMessageDto joinSession(UUID sessionId, UUID userId);
    HostReconnectResponse getHostReconnectState(UUID sessionId);
    ParticipantReconnectResponse getParticipantReconnectState(UUID participantId, UUID sessionId);
    List<AnswerKey> revealAnswer(UUID sessionId, UUID hostId);
    UUID getQuizIdBySessionId(UUID sessionId);
    public JoinQuizDto getQuizIdSessionIdByJoinCode(String joinCode);

}
