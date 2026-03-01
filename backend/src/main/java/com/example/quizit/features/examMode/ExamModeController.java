package com.example.quizit.features.examMode;

import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.user.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/quizit/exam-room")
@RequiredArgsConstructor
public class ExamModeController {
    private final ExamModeService examModeService;
    @Value("${security.jwt.cookie-secure}")
    private boolean isCookieSecure;

    @Value("${security.jwt.cookie-same-site}")
    private String sameSite;
    @PostMapping("/verify")
    public ResponseEntity<PreRegisterResponse> verifyParticipant(
            @RequestBody PreRegisterUserDto userDto,
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response) {

        System.out.println("Verify");

        User user = (User) authentication.getPrincipal();

        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();

        PreRegisterResponse preRegisterResponse =
                examModeService.preRegisterParticipant(
                        userDto,
                        user.getId(),
                        userAgent,
                        ipAddress
                );

        Cookie cookie = new Cookie(
                "participantId",
                preRegisterResponse.participant.getParticipantId().toString()
        );

        cookie.setHttpOnly(true);
        cookie.setSecure(isCookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(5 * 60 + 60);

        // ✅ add cookie normally
        response.addCookie(cookie);

        // ⭐ MINIMUM CHANGE → add SameSite manually
        response.setHeader(
                "Set-Cookie",
                String.format(
                        "participantId=%s; Max-Age=%d; Path=/; HttpOnly; %s; SameSite=%s",
                        preRegisterResponse.participant.getParticipantId(),
                        5 * 60 + 60,
                        isCookieSecure ? "Secure" : "",
                        sameSite
                )
        );

        return ResponseEntity.ok(preRegisterResponse);
    }
    @PostMapping("/{quizId}/start")
    public ResponseEntity<ExamNavigationResponse> startQuiz(
            @PathVariable UUID quizId,
            @CookieValue(value = "participantId") String participantId,
            HttpServletResponse httpResponse) {

        UUID pid = UUID.fromString(participantId);
        System.out.println(participantId);

        ExamNavigationResponse examResponse =
                examModeService.startExam(quizId, pid);

        Cookie cookie = new Cookie("participantId", participantId);
        cookie.setHttpOnly(true);
        cookie.setSecure(isCookieSecure);
        cookie.setPath("/");

        long seconds =
                Math.max(examResponse.getGlobalRemainingTimeMillis() / 1000, 1) + 300;

        cookie.setMaxAge((int) seconds);

        // ✅ normal cookie
        httpResponse.addCookie(cookie);

        // ⭐ MINIMUM CHANGE → SameSite fix
        httpResponse.setHeader(
                "Set-Cookie",
                String.format(
                        "participantId=%s; Max-Age=%d; Path=/; HttpOnly; %s; SameSite=%s",
                        participantId,
                        (int) seconds,
                        isCookieSecure ? "Secure" : "",
                        sameSite
                )
        );

        return ResponseEntity.ok(examResponse);
    }

    @PostMapping("/{quizId}/switchTo/{targetIndex}")
    public ResponseEntity<ExamNavigationResponse> switchQuestion(
            @PathVariable UUID quizId,
            @PathVariable int targetIndex,
            @CookieValue(value = "participantId") String participantId) {
        UUID pid = UUID.fromString(participantId);
        System.out.println(participantId);
        ExamNavigationResponse response = examModeService.switchQuestion(quizId, pid, targetIndex);
        if(response != null)
            return ResponseEntity.ok(response);
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{quizId}/submit-answer")
    public ResponseEntity<Map<String, String>> submitAnswer(
            @PathVariable UUID quizId,
            @RequestBody Map<String, Object> selectedAnswer,
            @CookieValue(value = "participantId") String participantId) {
        UUID pid = UUID.fromString(participantId);
        System.out.println(participantId);
        try {
            examModeService.submitAnswer(quizId, pid, selectedAnswer);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("message", "Answer saved successfully", "timestamp", String.valueOf(System.currentTimeMillis())));
    }

    @PostMapping("/{quizId}/submit-test")
    public void submitExam(@PathVariable UUID quizId,  @CookieValue(value = "participantId") String participantId){
        UUID pid = UUID.fromString(participantId);
        System.out.println(participantId);
        examModeService.submitExam(quizId, pid);
    }

}
