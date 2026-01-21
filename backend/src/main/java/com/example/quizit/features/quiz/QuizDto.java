package com.example.quizit.features.quiz;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizDto {

    private UUID quizId;
    private String quizName;
    private UUID host;
    private QuizStatus status;
    private QuizMode mode;
    private Instant startTime;
    private Instant endTime;
    private boolean allowGuest;
    private boolean shuffleQuestions;
    private boolean showLeaderboard;
    private Instant createdAt;
}
