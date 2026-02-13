package com.example.quizit.features.quiz.AIQuiz;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class QuizGenerationController {

    private final QuizGenerationService quizGenerationService;

    @PostMapping("/quizzes/generate")
    public ResponseEntity<GenerateQuizResponseDto> generate( @RequestBody GenerateQuizRequestDto request) {
        return ResponseEntity.ok(quizGenerationService.generateFromPrompt(request));
    }
}