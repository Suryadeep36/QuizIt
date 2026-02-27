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

    @PostMapping("/{quizId}/start/{participantId}")
    public ResponseEntity<ExamNavigationResponse> startQuiz(
            @PathVariable UUID quizId,
            @PathVariable UUID participantId) {
        ExamNavigationResponse response = examModeService.startExam(quizId, participantId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{quizId}/switchTo/{targetIndex}/{participantId}")
    public ResponseEntity<ExamNavigationResponse> switchQuestion(
            @PathVariable UUID quizId,
            @PathVariable int targetIndex,
            @PathVariable UUID participantId) {

        ExamNavigationResponse response = examModeService.switchQuestion(quizId, participantId, targetIndex);
        if(response != null)
            return ResponseEntity.ok(response);
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{quizId}/submit-answer/{participantId}")
    public ResponseEntity<Map<String, String>> submitAnswer(
            @PathVariable UUID quizId,
            @RequestBody Map<String, Object> selectedAnswer,
            @PathVariable UUID participantId) {

        try {
            examModeService.submitAnswer(quizId, participantId, selectedAnswer);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }

        return ResponseEntity.ok(Map.of("message", "Answer saved successfully", "timestamp", String.valueOf(System.currentTimeMillis())));
    }

    @PostMapping("/{quizId}/submit-test/{participantId}")
    public void submitExam(@PathVariable UUID quizId, @PathVariable UUID participantId){
        examModeService.submitExam(quizId, participantId);
    }

}
