package com.example.quizit.features.questionAnalyticsQuiz;

import java.util.List;

public interface QuestionAnalyticsQuizService {

    QuestionAnalyticsQuizDto createQuestionAnalytics(QuestionAnalyticsQuizDto dto);
    QuestionAnalyticsQuizDto getQuestionAnalyticsByQuestionId(String questionId);
    List<QuestionAnalyticsQuizDto> getAnalyticsByQuizId(String quizId);
    List<QuestionAnalyticsQuizDto> getAllQuestionAnalytics();
}
