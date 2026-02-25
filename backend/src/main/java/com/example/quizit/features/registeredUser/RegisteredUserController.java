package com.example.quizit.features.registeredUser;

import com.example.quizit.features.user.User;
import com.example.quizit.features.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/quizit/exam")
@AllArgsConstructor
public class RegisteredUserController {
    private final RegisteredUserService registeredUserService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<RegisteredUserDto> registerExam(@RequestBody RegisteredUserDto registeredUserDto, Authentication authentication, HttpServletRequest request) {
        User user = (User) authentication.getPrincipal();
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();
        return ResponseEntity.ok(registeredUserService.registerUser(registeredUserDto, user, userAgent, ipAddress));
    }
}
