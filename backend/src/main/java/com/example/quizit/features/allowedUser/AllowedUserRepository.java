package com.example.quizit.features.allowedUser;

import com.example.quizit.features.quiz.Quiz;
import jakarta.validation.constraints.Email;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;

import java.util.List;
import java.util.UUID;

public interface AllowedUserRepository extends JpaRepository<AllowedUser, UUID> {

    boolean existsAllowedUserByEmailAndQuiz_QuizId(String email, UUID quizQuizId);

    List<AllowedUser> findAllByQuiz_QuizId(UUID quizId);


    List<AllowedUser> findAllowedUsersByQuiz_QuizIdAndInvitationStatus(UUID quizQuizId, InvitationStatus invitationStatus);
}
