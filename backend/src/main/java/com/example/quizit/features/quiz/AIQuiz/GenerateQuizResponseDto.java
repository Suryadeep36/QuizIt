package com.example.quizit.features.quiz.AIQuiz;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GenerateQuizResponseDto {

    @NotNull
    @Valid
    private AiGeneratedQuizDto quiz;

    @NotEmpty
    @Valid
    private List<AiGeneratedQuestionDto> questions;

    private String provider; // "openai"
    private String model;    // e.g. "gpt-4.1-mini"
}