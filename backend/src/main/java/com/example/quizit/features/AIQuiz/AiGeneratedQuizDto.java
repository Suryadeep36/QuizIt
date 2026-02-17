package com.example.quizit.features.AIQuiz;


import com.example.quizit.features.quiz.QuizMode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@JsonIgnoreProperties(ignoreUnknown = true)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiGeneratedQuizDto {

    @NotBlank
    @Size(max = 120)
    private String quizName;

    private QuizMode mode;
    private Boolean allowGuest;
    private Boolean shuffleQuestions;
    private Boolean showLeaderboard;
}
