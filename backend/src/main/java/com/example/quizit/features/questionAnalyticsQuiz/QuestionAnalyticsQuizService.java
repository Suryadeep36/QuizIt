package com.example.quizit.features.questionAnalyticsQuiz;

import jakarta.transaction.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuestionAnalyticsQuizService {
    QuestionAnalyticsQuizDto createQuestionAnalytics(QuestionAnalyticsQuizDto dto);
    QuestionAnalyticsQuizDto getQuestionAnalyticsByQuestionId(String questionId);
    List<QuestionAnalyticsQuizDto> getAnalyticsByQuizId(String quizId);
    List<QuestionAnalyticsQuizDto> getAllQuestionAnalytics();
    public List<QuestionWithAnalyticsDto> getDetailedAnalyticsByQuizId(String quizId) ;
//    void increaseTotalAnswered(UUID questionId);
    public void createAllByQuizId(String quizId,UUID userId);

    @Transactional
    void calculateAfterQuiz(UUID quizId,UUID userId);
}
