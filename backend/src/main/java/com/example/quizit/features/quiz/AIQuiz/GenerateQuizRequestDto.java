package com.example.quizit.features.quiz.AIQuiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GenerateQuizRequestDto {

    @NotBlank
    @Size(max = 4000)
    private String prompt;
}
