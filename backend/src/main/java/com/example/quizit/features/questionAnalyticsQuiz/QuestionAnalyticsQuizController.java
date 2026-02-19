package com.example.quizit.features.questionAnalyticsQuiz;

import com.example.quizit.features.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
    @PostMapping("/question-analytics-quiz/{quizId}")
    public void createQuestionAnalytics(@PathVariable String quizId, @AuthenticationPrincipal User user) {
       questionAnalyticsQuizService.createAllByQuizId(quizId,user.getId());
        return;
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

    @GetMapping("/question-analytics-quiz/quiz/{quizId}/detailed")
    public ResponseEntity<List<QuestionWithAnalyticsDto>>
    getDetailedAnalyticsByQuiz(@PathVariable String quizId) {

        List<QuestionWithAnalyticsDto> response =
                questionAnalyticsQuizService.getDetailedAnalyticsByQuizId(quizId);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/question-analytics-quiz")
    public ResponseEntity<List<QuestionAnalyticsQuizDto>> getAllAnalytics() {
        List<QuestionAnalyticsQuizDto> allAnalytics = questionAnalyticsQuizService.getAllQuestionAnalytics();
        return ResponseEntity.ok(allAnalytics);
    }

}
