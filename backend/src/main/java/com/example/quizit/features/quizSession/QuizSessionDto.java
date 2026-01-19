package com.example.quizit.features.quizSession;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizSessionDto {
    private UUID sessionId;
    private UUID quizId;
    private QuizSessionStatus status;
    private Integer currentQuestionIndex;
    private Integer totalQuestions;
    private UUID currentQuestionId;
}
