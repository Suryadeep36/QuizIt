package com.example.quizit.features.question;

import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;


@AllArgsConstructor
@Builder
@NoArgsConstructor
@Setter
@Getter
public class QuestionDto {
    private UUID questionId;
    private UUID quizId;
    private String content;
    private List<AnswerKey> correctAnswer;
    private Map<String, Object> options;
    private Integer duration;
    private QuestionType questionType;
    private DifficultyLevel difficultyLevel;
    private String imageUrl;
    private Boolean caseSensitive;
    private List<String> acceptableAnswers;
    private Integer maxAnswerLength;
    private Boolean allowMultipleAnswers;
    private Boolean isAIGenerated;
    private Integer displayOrder;
    private Integer points;
}