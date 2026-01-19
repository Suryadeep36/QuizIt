package com.example.quizit.features.question;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface QuestionRepository extends JpaRepository<Question, UUID> {

     Question save(Question question);
     long countQuestionByQuiz_QuizId(UUID quizQuizId);
    List<Question> findByQuiz_QuizId(UUID quizQuizId);
}
