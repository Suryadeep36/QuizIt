package com.example.quizit.features.AIQuiz;

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
    @Size(max = 300)
    private String prompt;
}
