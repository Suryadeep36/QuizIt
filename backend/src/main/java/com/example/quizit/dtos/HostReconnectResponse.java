package com.example.quizit.dtos;

import com.example.quizit.features.participantSession.ParticipantSession;
import com.example.quizit.features.participantSession.ParticipantSessionDto;
import com.example.quizit.features.question.AnswerKey;
import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.quizSession.QuizSessionStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class HostReconnectResponse {
    private UUID sessionId;
    private UUID quizId;
    private QuizSessionStatus status;
    private Integer currentQuestionIndex;
    private Integer totalQuestions;
    private QuestionForUserDto currentQuestionState;
    private String joinCode;
    // Participant info
    private List<ParticipantSessionDto> participants;
    private Integer participantCount;
    private List<AnswerKey> correctAnswer;
}