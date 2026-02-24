package com.example.quizit.features.registeredUser;

import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.allowedUser.AllowedUserRepository;
import com.example.quizit.features.emailService.EmailService;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SendJoinLinkService {
    private final QuizRepository quizRepository;
    private final AllowedUserRepository allowedUserRepository;
    private final EmailService emailService;
    @Value("${app.auth.frontend.base-url}")
    private String registerUrl;

    @Transactional
    public void sendJoinLinkAll(UUID quizId, UUID hostId){
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("Not quiz host");
        }

        List<AllowedUser> users = allowedUserRepository.findAllByQuiz_QuizIdAndRegistered(quizId, true);

        for (AllowedUser user : users) {
            sendJoinLinkInternal(quiz, user);
        }
    }
    private void sendJoinLinkInternal(Quiz quiz, AllowedUser user) {
        String link = registerUrl + "/waiting-room/" + quiz.getQuizId();
        try {
            emailService.sendRegisterMail(
                    user.getEmail(),
                    "🚀 Your Join Link for "+ quiz.getQuizName() +" is Ready! | QuizIt",
                    buildSendJoinLinkBody(quiz, link)
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    private String buildSendJoinLinkBody(Quiz quiz, String joinLink) {
        String hostName = quiz.getHost().getUsername();

        // Indian Date-Time Formatting (dd-MM-yyyy HH:mm)
        ZoneId indiaZone = ZoneId.of("Asia/Kolkata");

        // 2. Define the Formatter
        DateTimeFormatter indianFormatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy, hh:mm a");

        // 3. Convert Instant to ZonedDateTime and then format
        String startTime = quiz.getStartTime() != null
                ? quiz.getStartTime().atZone(indiaZone).format(indianFormatter)
                : "To be announced";

        String endTime = quiz.getEndTime() != null
                ? quiz.getEndTime().atZone(indiaZone).format(indianFormatter)
                : "Check portal";

        return """
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table width="500" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #0891b2 0%%, #0e7490 100%%); padding: 35px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">QuizIt</h1>
                                <p style="color: #cffafe; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Secure Access Token</p>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="padding: 40px 32px;">
                                <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; text-align: center;">Join Link Generated!</h2>
                                
                                <div style="background-color: #fff7ed; border-left: 4px solid #fb923c; padding: 15px; margin-bottom: 24px;">
                                    <p style="color: #9a3412; font-size: 13px; margin: 0; font-weight: 600;">
                                        ⚠️ JOINING POLICY:
                                    </p>
                                    <p style="color: #c2410c; font-size: 13px; margin: 5px 0 0 0;">
                                        • Please join the waiting room <b>5 minutes before</b> the start time.<br/>
                                        • Access is only allowed between the start and end time. Entry will be <b>blocked</b> after the end time.
                                    </p>
                                </div>

                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 32px;">
                                    <table width="100%%">
                                        <tr>
                                            <td style="padding: 4px 0;"><span style="color: #94a3b8; font-size: 13px;">Quiz:</span></td>
                                            <td align="right"><span style="color: #1f2937; font-weight: 600; font-size: 14px;">%s</span></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 4px 0;"><span style="color: #94a3b8; font-size: 13px;">Starts:</span></td>
                                            <td align="right"><span style="color: #1f2937; font-weight: 600; font-size: 14px;">%s</span></td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 4px 0;"><span style="color: #94a3b8; font-size: 13px;">Ends:</span></td>
                                            <td align="right"><span style="color: #ef4444; font-weight: 600; font-size: 14px;">%s</span></td>
                                        </tr>
                                    </table>
                                </div>

                                <div style="text-align: center;">
                                    <a href="%s" style="background-color: #fb923c; color: #ffffff; padding: 16px 32px; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(251, 146, 60, 0.4);">
                                        Enter Waiting Room
                                    </a>
                                </div>
                            </td>
                        </tr>
                        
                        <tr>
                            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
                                <p style="color: #6b7280; font-size: 11px; margin: 0;">
                                    This link is unique to your email. Do not share it.<br/>
                                    &copy; 2026 QuizIt Inc.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """.formatted(
                quiz.getQuizName(),
                startTime,
                endTime,
                joinLink
        );
    }
}
