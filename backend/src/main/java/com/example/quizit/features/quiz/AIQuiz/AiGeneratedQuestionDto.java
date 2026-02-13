package com.example.quizit.features.quiz.AIQuiz;


import com.example.quizit.features.question.DifficultyLevel;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiGeneratedQuestionDto {

    @NotBlank
    @Size(max = 4000)
    private String content;

//    @NotNull
//    private QuestionType questionType;

    @NotNull
    private DifficultyLevel difficultyLevel;

    @Min(10)
    @Max(600)
    private Integer duration; // seconds

    // For MCQ / TRUE_FALSE / etc.
    private Map<String, Object> options;

//     For MCQ etc.
    private List<AnswerKey> correctAnswer;

    // For short-answer style
    private Boolean caseSensitive;
    private List<String> acceptableAnswers;

    @Min(1)
    @Max(1000)
    private Integer maxAnswerLength;

    private Boolean allowMultipleAnswers;

    @Size(max = 2048)
    private String imageUrl;
}
