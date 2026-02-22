package com.example.quizit.features.allowedUser;

import com.example.quizit.features.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AllowedUserRepository extends JpaRepository<AllowedUser, UUID> {

    boolean existsAllowedUserByEmailAndQuiz_QuizId(String email, UUID quizQuizId);
}
