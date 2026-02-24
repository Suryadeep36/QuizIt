package com.example.quizit.features.allowedUser;

import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InvitationService {
    private final QuizRepository quizRepository;
    private final AllowedUserRepository allowedUserRepository;

    public void sendOneEmail(UUID quizId, UUID allowedUserId, UUID hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("Not quiz host");
        }

        AllowedUser user = allowedUserRepository.findById(allowedUserId)
                .orElseThrow(() -> new RuntimeException("Allowed user not found"));

        if (!user.getQuiz().getQuizId().equals(quizId)) {
            throw new IllegalArgumentException("User does not belong to quiz");
        }

        sendInvitationInternal(quiz, user);
    }

    @Transactional
    public void sendAllEmail(UUID quizId, UUID hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("Not quiz host");
        }

        List<AllowedUser> users = allowedUserRepository.findAllowedUsersByQuiz_QuizIdAndInvitationStatus(quizId, List.of(InvitationStatus.NOT_SENT, InvitationStatus.FAILED));

        for (AllowedUser user : users) {
            sendInvitationInternal(quiz, user);
        }
    }

    private void sendInvitationInternal(Quiz quiz, AllowedUser user) {

        String link = "https://quizit.com/register?token=" + user.getToken();

        try {
            emailService.send(
                    user.getEmail(),
                    "Invitation to " + quiz.getQuizName(),
                    buildEmailBody(quiz, link)
            );

            user.setInvitationStatus(InvitationStatus.SENT);
            user.setInvitationSentAt(Instant.now());
            user.setDeliveryErrorMessage(null);

        } catch (Exception e) {
            user.setInvitationStatus(InvitationStatus.FAILED);
            user.setDeliveryErrorMessage(e.getMessage());
        }
    }
}
