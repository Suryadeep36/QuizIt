package com.example.quizit.features.quiz.AIQuiz;

public interface AiQuizClient {
    GenerateQuizResponseDto generate(String prompt);
}