package com.example.quizit.controllers;


import com.example.quizit.dtos.HostReconnectResponse;
import com.example.quizit.dtos.QuizSessionDto;
import com.example.quizit.services.interfaces.QuizSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
            @RequestParam UUID hostId
    ) {
        QuizSessionDto dto = quizSessionService.createQuizSession(quizId, hostId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<QuizSessionDto> endQuiz(
            @PathVariable UUID sessionId
    ) {
        QuizSessionDto dto = quizSessionService.endQuiz(sessionId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{sessionId}/host-reconnect")
    public ResponseEntity<HostReconnectResponse> hostReconnect(@PathVariable UUID sessionId){
        HostReconnectResponse dto = quizSessionService.getHostReconnectState(sessionId);
        return ResponseEntity.ok(dto);
    }

}