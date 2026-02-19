package com.example.quizit.features.AIQuiz;


import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.UUID;

public interface QuizGenerationService {
    GenerateQuizResponseDto generateFromPrompt(GenerateQuizRequestDto request,UUID quizId, UUID userId) throws JsonProcessingException;
}