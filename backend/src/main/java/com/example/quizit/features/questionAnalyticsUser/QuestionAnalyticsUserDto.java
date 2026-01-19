package com.example.quizit.features.questionAnalyticsUser;

import lombok.*;

import java.util.Map;
import java.util.UUID;
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class QuestionAnalyticsUserDto {

    private UUID qauId;
    private UUID questionId;
    private UUID participantId;
    private Integer timeSpent;
    private Map<String, Object> selectedAnswer;
    private Boolean isCorrect;
    private Integer tabSwitchCount;
}