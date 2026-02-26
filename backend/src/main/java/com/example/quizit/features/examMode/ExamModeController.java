package com.example.quizit.features.examMode;

import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.user.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/verify")
    public ResponseEntity<PreRegisterResponse> verifyParticipant(
            @RequestBody PreRegisterUserDto userDto,
            Authentication authentication, HttpServletRequest request) {
        System.out.println("Verify");
        User user = (User) authentication.getPrincipal();
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();
        PreRegisterResponse response = examModeService.preRegisterParticipant(userDto, user.getId(), userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<ExamNavigationResponse> startQuiz(
            @PathVariable UUID quizId,
            @RequestAttribute UUID participantId) {
        ExamNavigationResponse response = examModeService.startExam(quizId, participantId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{quizId}/switch")
    public ResponseEntity<ExamNavigationResponse> switchQuestion(
            @PathVariable UUID quizId,
            @RequestParam int targetIndex,
            @RequestAttribute UUID participantId) {

        ExamNavigationResponse response = examModeService.switchQuestion(quizId, participantId, targetIndex);
        if(response != null)
            return ResponseEntity.ok(response);
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{quizId}/submit-answer")
    public ResponseEntity<Map<String, String>> submitAnswer(
            @PathVariable UUID quizId,
            @RequestBody Map<String, Object> selectedAnswer,
            @RequestAttribute UUID participantId) {

        if (selectedAnswer == null || selectedAnswer.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Answer cannot be empty"));
        }

        try {
            examModeService.submitAnswer(quizId, participantId, selectedAnswer);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("message", "Answer saved successfully", "timestamp", String.valueOf(System.currentTimeMillis())));
    }

}
