package com.example.quizit.controllers;//package com.example.quizit.controllers;

import com.example.quizit.features.questionAnalyticsQuiz.QuestionAnalyticsQuizService;
import com.example.quizit.features.quiz.QuizService;
import com.example.quizit.features.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RequiredArgsConstructor
@RequestMapping("/quizit")
@RestController
public class ServiceController {

    private final QuizService quizService;
    private final QuestionAnalyticsQuizService questionAnalyticsQuizService;

    @PostMapping("/quiz/{quizId}/end")
    public ResponseEntity<Void> endQuiz(@PathVariable UUID quizId,@AuthenticationPrincipal User user) {
        System.out.println("endQuiz");
        quizService.endQuiz(quizId);
        questionAnalyticsQuizService.createAllByQuizId(quizId.toString(),user.getId());
        questionAnalyticsQuizService.calculateAfterQuiz(quizId,user.getId());
        return ResponseEntity.ok().build();
    }

}
