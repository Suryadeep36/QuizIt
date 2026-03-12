package com.example.quizit.features.allowedUser;

import com.example.quizit.features.quiz.Quiz;
import jakarta.validation.constraints.Email;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AllowedUserRepository extends JpaRepository<AllowedUser, UUID> {

    boolean existsAllowedUserByEmailAndQuiz_QuizId(String email, UUID quizQuizId);

    List<AllowedUser> findAllByQuiz_QuizId(UUID quizId);


    void deleteAllowedUsersByQuiz_QuizIdAndEmailIn(UUID quizQuizId, Collection<String> emails);

    List<AllowedUser> findAllowedUsersByQuiz_QuizIdAndInvitationStatus(UUID quizQuizId, InvitationStatus invitationStatus);

    List<AllowedUser> findAllowedUsersByQuiz_QuizIdAndInvitationStatusIn(UUID quizQuizId, Collection<InvitationStatus> invitationStatuses);

    Optional<AllowedUser> findByEmailAndToken(String email, String token);

    Optional<AllowedUser> findByEmailAndQuiz_QuizId(String email, UUID quizQuizId);

    List<AllowedUser> findAllByQuiz_QuizIdAndRegistered(UUID quizId, boolean b);

    long countAllowedUserByInvitationStatus(InvitationStatus invitationStatus);

    Long countAllowedUserByQuiz_QuizIdAndInvitationStatus(UUID quizQuizId, InvitationStatus invitationStatus);
}
