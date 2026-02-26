package com.example.quizit.features.examMode;

import com.example.quizit.features.user.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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


}
