package com.example.quizit.features.AIQuiz;


import com.example.quizit.features.user.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class QuizGenerationController {

    private final QuizGenerationService quizGenerationService;

    @PostMapping("/quizzes/generate-with-ai/{quizId}")
    public ResponseEntity<GenerateQuizResponseDto> generate(@RequestBody GenerateQuizRequestDto request, @PathVariable UUID quizId, @AuthenticationPrincipal User user) throws JsonProcessingException {
        System.out.println("Generating Quiz");
        System.out.println(request.getPrompt());
        return ResponseEntity.ok(quizGenerationService.generateFromPrompt(request,quizId,user.getId()));
//        return null;
    }
}