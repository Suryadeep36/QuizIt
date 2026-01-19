package com.example.quizit.features.quizAnalytics;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizAnalyticsDto {
    private UUID quizAnalyticsId;
    private UUID quizId;
    private UUID winnerUserId;
    private float averageScore;
    private long totalDuration;
}
