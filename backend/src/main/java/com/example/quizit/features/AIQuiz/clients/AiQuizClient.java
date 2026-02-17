package com.example.quizit.features.AIQuiz.clients;

import com.example.quizit.features.AIQuiz.GenerateQuizResponseDto;

public interface AiQuizClient {
    GenerateQuizResponseDto generate(String prompt);
}