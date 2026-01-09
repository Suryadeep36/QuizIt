package com.example.quizit.dtos;

import com.example.quizit.enums.QuizSessionStatus;
import lombok.*;

import java.time.Instant;
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
