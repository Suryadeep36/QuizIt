package com.example.quizit.features.quiz.AIQuiz;


public interface QuizGenerationService {
    GenerateQuizResponseDto generateFromPrompt(GenerateQuizRequestDto request);
}