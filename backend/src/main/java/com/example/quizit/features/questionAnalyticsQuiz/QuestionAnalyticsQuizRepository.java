package com.example.quizit.features.questionAnalyticsQuiz;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface QuestionAnalyticsQuizRepository extends JpaRepository<QuestionAnalyticsQuiz, UUID> {
    boolean existsByQuestion_QuestionId(UUID questionId);
    Optional<QuestionAnalyticsQuiz> getQuestionAnalyticsQuizByQuestion_QuestionId(UUID questionId);
    Optional<QuestionAnalyticsQuiz> getQuestionAnalyticsQuizByQuiz_QuizId(UUID quizQuizId);
}
