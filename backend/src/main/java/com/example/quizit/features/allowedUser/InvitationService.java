package com.example.quizit.features.allowedUser;

import com.example.quizit.features.emailService.EmailService;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InvitationService {
    private final QuizRepository quizRepository;
    private final AllowedUserRepository allowedUserRepository;
    private final EmailService emailService;
    @Value("${app.auth.frontend.base-url}")
    private String registerUrl;

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

        List<AllowedUser> users = allowedUserRepository.findAllowedUsersByQuiz_QuizIdAndInvitationStatusIn(quizId, List.of(InvitationStatus.NOT_SENT, InvitationStatus.FAILED));

        for (AllowedUser user : users) {
            sendInvitationInternal(quiz, user);
        }
    }

    private void sendInvitationInternal(Quiz quiz, AllowedUser user) {
        String link = registerUrl + "/register-exam/" + quiz.getQuizId() + "/" + user.getToken();
        try {
            emailService.sendRegisterMail(
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

    private String buildEmailBody(Quiz quiz, String registrationLink) {

        String hostName = quiz.getHost().getUsername();

        String startTime = quiz.getStartTime() != null
                ? quiz.getStartTime().toString()
                : "To be announced";

        String endTime = quiz.getEndTime() != null
                ? quiz.getEndTime().toString()
                : "Not specified";

        return """
        <html>
            <body style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
                <div style="max-width:600px; margin:auto; background:white; padding:25px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">

                    <h2 style="color:#2c3e50; margin-bottom:10px;">
                        🎯 You’re Invited to a Quiz!
                    </h2>

                    <p style="font-size:16px;">
                        <strong>Quiz Name:</strong> %s
                    </p>

                    <p>
                        <strong>Hosted By:</strong> %s
                    </p>

                    <p>
                        <strong>Mode:</strong> %s
                    </p>

                    <p>
                        <strong>Start Time:</strong> %s <br/>
                        <strong>End Time:</strong> %s
                    </p>

                    <hr/>
                    <div style="text-align:center; margin-top:25px;">
                        <a href="%s"
                           style="background-color:#4CAF50;
                                  color:white;
                                  padding:12px 25px;
                                  text-decoration:none;
                                  font-size:16px;
                                  border-radius:6px;
                                  display:inline-block;">
                            Register for Quiz
                        </a>
                    </div>

                    <p style="margin-top:30px; font-size:13px; color:#7f8c8d;">
                        If you did not expect this invitation, you can safely ignore this email.
                    </p>

                    <p style="margin-top:20px;">
                        Regards,<br/>
                        <strong>QuizIt Team</strong>
                    </p>

                </div>
            </body>
        </html>
        """.formatted(
                quiz.getQuizName(),
                hostName,
                quiz.getMode(),
                startTime,
                endTime,
                registrationLink
        );
    }
}
