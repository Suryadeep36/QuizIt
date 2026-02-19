package com.example.quizit.features.questionAnalyticsQuiz;

import com.example.quizit.features.question.QuestionDto;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionWithAnalyticsDto {

    private QuestionDto question;
    private QuestionAnalyticsQuizDto analytics;

    // Optional calculated field
    private Double accuracyPercentage;
}