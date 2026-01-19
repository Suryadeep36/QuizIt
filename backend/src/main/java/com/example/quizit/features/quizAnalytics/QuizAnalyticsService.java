package com.example.quizit.features.quizAnalytics;

import java.util.List;

public interface QuizAnalyticsService {
    QuizAnalyticsDto createQuizAnalytics(QuizAnalyticsDto quizAnalyticsDto);
    QuizAnalyticsDto getAnalyticsByQuizId(String quizId);
    List<QuizAnalyticsDto> getAllAnalytics();
    List<QuizAnalyticsDto> getAnalyticsByWinnerUser(String userId);
}
