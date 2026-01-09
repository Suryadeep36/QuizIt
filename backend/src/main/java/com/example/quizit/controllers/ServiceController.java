package com.example.quizit.controllers;//package com.example.quizit.controllers;

import com.example.quizit.repositories.QuizRepository;
import com.example.quizit.services.interfaces.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    @PostMapping("/quiz/{quizId}/end")
    public ResponseEntity<Void> endQuiz(@PathVariable UUID quizId) {
        System.out.println("endQuiz");
        quizService.endQuiz(quizId);
        return ResponseEntity.ok().build();
    }

}
