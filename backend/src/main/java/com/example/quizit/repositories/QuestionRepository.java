package com.example.quizit.repositories;

import com.example.quizit.dtos.QuestionDto;
import com.example.quizit.entities.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;


public interface QuestionRepository extends JpaRepository<Question, UUID> {

     Question save(Question question);
     long countQuestionByQuiz_QuizId(UUID quizQuizId);
    List<Question> findByQuiz_QuizId(UUID quizQuizId);
}
