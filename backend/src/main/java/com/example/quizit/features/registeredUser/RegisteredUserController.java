package com.example.quizit.features.registeredUser;

import com.example.quizit.features.user.User;
import com.example.quizit.features.user.UserRepository;
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

@RequestMapping("/quizit")
@RestController
@AllArgsConstructor
public class RegisteredUserController {
    private final RegisteredUserService registeredUserService;
    private final UserRepository userRepository;

    @PostMapping("/registerexam")
    public ResponseEntity<RegisteredUserDto>  registerExam( @RequestBody RegisteredUserDto registeredUserDto, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        System.out.println("registerExam");
       return ResponseEntity.ok(registeredUserService.registerUser(registeredUserDto,user));
    }
}
