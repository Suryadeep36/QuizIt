package com.example.quizit.features.allowedUser;

import com.example.quizit.features.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizit")
public class AllowedUserController {

    private final AllowedUserSerivce allowedUserSerivce;

    public AllowedUserController(AllowedUserSerivce allowedUserSerivce) {
        this.allowedUserSerivce = allowedUserSerivce;
    }

    @GetMapping("/allowed-user/quiz/{quizId}")
    public ResponseEntity<List<AllowedUserStatusDto>> getAllAllowedUser
            (@PathVariable String quizId,@AuthenticationPrincipal User user) {
        return ResponseEntity.ok().body(allowedUserSerivce.getAllAllowedUser(quizId,user.getId()));
    }
}
