package com.example.quizit.features.questionAnalyticsQuiz;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class QuestionAnalyticsQuizController {

    private final QuestionAnalyticsQuizService questionAnalyticsQuizService;

    @PostMapping("/question-analytics-quiz")
    public ResponseEntity<QuestionAnalyticsQuizDto> createQuestionAnalytics(
            @RequestBody QuestionAnalyticsQuizDto dto) {
        QuestionAnalyticsQuizDto created = questionAnalyticsQuizService.createQuestionAnalytics(dto);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/question-analytics-quiz/question/{questionId}")
    public ResponseEntity<QuestionAnalyticsQuizDto> getAnalyticsByQuestion(
            @PathVariable String questionId) {
        QuestionAnalyticsQuizDto analytics = questionAnalyticsQuizService.getQuestionAnalyticsByQuestionId(questionId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/question-analytics-quiz/quiz/{quizId}")
    public ResponseEntity<List<QuestionAnalyticsQuizDto>> getAnalyticsByQuiz(
            @PathVariable String quizId) {
        List<QuestionAnalyticsQuizDto> analyticsList = questionAnalyticsQuizService.getAnalyticsByQuizId(quizId);
        return ResponseEntity.ok(analyticsList);
    }

    @GetMapping("/question-analytics-quiz")
    public ResponseEntity<List<QuestionAnalyticsQuizDto>> getAllAnalytics() {
        List<QuestionAnalyticsQuizDto> allAnalytics = questionAnalyticsQuizService.getAllQuestionAnalytics();
        return ResponseEntity.ok(allAnalytics);
    }

}
