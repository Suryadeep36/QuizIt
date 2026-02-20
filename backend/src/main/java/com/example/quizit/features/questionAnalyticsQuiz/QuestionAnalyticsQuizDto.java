package com.example.quizit.features.questionAnalyticsQuiz;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionAnalyticsQuizDto {
    private UUID qaqId;
    private UUID quizId;
    private UUID questionId;
    private Integer totalAnswered;
    private Integer correctAnswerCount;
    private String fastestUserId;
    private long averageTime;
}
