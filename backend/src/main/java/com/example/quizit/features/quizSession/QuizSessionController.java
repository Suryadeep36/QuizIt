package com.example.quizit.features.quizSession;


import com.example.quizit.dtos.HostReconnectResponse;
import com.example.quizit.features.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/quizit/quiz-session")
@RequiredArgsConstructor
public class QuizSessionController {

    private final QuizSessionService quizSessionService;

    @PostMapping("/create")
    public ResponseEntity<QuizSessionDto> createQuizSession(
            @RequestParam UUID quizId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        QuizSessionDto dto = quizSessionService.createQuizSession(quizId, user.getId());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{joincode}")
    public ResponseEntity<JoinQuizDto> getQuizidSessionid(@PathVariable String joincode){
        return ResponseEntity.ok(quizSessionService.getQuizIdSessionIdByJoinCode(joincode));
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<QuizSessionDto> endQuiz(
            @PathVariable UUID sessionId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();
        QuizSessionDto dto = quizSessionService.endQuiz(sessionId, user.getId());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{sessionId}/host-reconnect")
    public ResponseEntity<HostReconnectResponse> hostReconnect(@PathVariable UUID sessionId){
        HostReconnectResponse dto = quizSessionService.getHostReconnectState(sessionId);
        return ResponseEntity.ok(dto);
    }

}