package com.example.quizit.features.examMode;

import com.example.quizit.features.user.User;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/quizit/exam-room")
@RequiredArgsConstructor
public class ExamModeController {
    private final ExamModeService examModeService;

    @PostMapping("/verify")
    public ResponseEntity<PreRegisterResponse> verifyParticipant(
            @RequestBody PreRegisterUserDto userDto,
            Authentication authentication) {
        System.out.println("Verify");
        User user = (User) authentication.getPrincipal();
        PreRegisterResponse response = examModeService.preRegisterParticipant(userDto, user.getId());

        return ResponseEntity.ok(response);
    }
}
