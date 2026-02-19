package com.example.quizit.dtos;

import com.example.quizit.features.participantSession.ParticipantSession;
import com.example.quizit.features.question.AnswerKey;
import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.quizSession.QuizSessionStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Builder
@Data
public class ParticipantReconnectResponse {
    private UUID sessionId;
    private UUID quizId;
    private QuizSessionStatus status;
    private Integer currentQuestionIndex;
    private Integer totalQuestions;
    private QuestionForUserDto currentQuestionState;
    private String joinCode;
    private Integer participantCount;
    private List<AnswerKey> correctAnswer;
    private Map<String, Object> selectedAnswer;
    private Boolean isCorrect;
}
