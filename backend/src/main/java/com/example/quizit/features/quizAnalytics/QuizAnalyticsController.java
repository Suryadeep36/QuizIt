package com.example.quizit.features.quizAnalytics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/quizit/quiz-analytics")
@RestController
public class QuizAnalyticsController {

    private final QuizAnalyticsService quizAnalyticsService;

    @GetMapping
    public ResponseEntity<List<QuizAnalyticsDto>> getAllQuizAnalytics() {
        return ResponseEntity.ok(quizAnalyticsService.getAllAnalytics());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<QuizAnalyticsDto> getAnalyticsByQuizId(
            @PathVariable String quizId
    ) {
        return ResponseEntity.ok(
                quizAnalyticsService.getAnalyticsByQuizId(quizId)
        );
    }

    @GetMapping("/winner/{userId}")
    public ResponseEntity<List<QuizAnalyticsDto>> getAnalyticsByWinnerUser(
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(
                quizAnalyticsService.getAnalyticsByWinnerUser(userId)
        );
    }

    @PostMapping
    public ResponseEntity<QuizAnalyticsDto> createQuizAnalytics(
            @RequestBody QuizAnalyticsDto quizAnalyticsDto
    ) {
        QuizAnalyticsDto created =
                quizAnalyticsService.createQuizAnalytics(quizAnalyticsDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
