package com.example.quizit.features.AIQuiz;


import com.example.quizit.features.question.QuestionDto;
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
    private List<QuestionDto> questions;

    private String provider; // "openai"
    private String model;    // e.g. "gpt-4.1-mini"
}