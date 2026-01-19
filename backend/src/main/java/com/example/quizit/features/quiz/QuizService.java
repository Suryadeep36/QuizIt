package com.example.quizit.features.quiz;

import java.util.List;
import java.util.UUID;

public interface QuizService {

    QuizDto createQuiz(QuizDto quizDto);
    QuizDto updateQuiz(String quizId, QuizDto quizDto);
    QuizDto getQuizById(String quizId);
    List<QuizDto> getQuizzesByHost(String hostId);
    List<QuizDto> getAllQuizzes();
    void deleteQuiz(String quizId);
    public void endQuiz(UUID quizId);
}
