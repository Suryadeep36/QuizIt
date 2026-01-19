package com.example.quizit.features.quiz;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequestMapping("/quizit")
@RestController
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;

    @GetMapping("/quiz")
    public ResponseEntity<List<QuizDto>> getAllQuizs(){
        return ResponseEntity.status(200).body(quizService.getAllQuizzes());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<QuizDto> getQuizById(@PathVariable String quizId){
        return ResponseEntity.status(200).body(quizService.getQuizById(quizId));
    }

    @GetMapping("/quiz/host/{hostId}")
    public ResponseEntity<List<QuizDto>> getQuizsByHostId(@PathVariable String hostId){
        return ResponseEntity.status(200).body(quizService.getQuizzesByHost(hostId));
    }

    @PostMapping("/quiz")
    public ResponseEntity<QuizDto> createQuiz(@RequestBody QuizDto quizDto){
        return ResponseEntity.status(200).body(quizService.createQuiz(quizDto));
    }

    @PutMapping("/quiz/{quizId}")
    public ResponseEntity<QuizDto> updateQuiz(@PathVariable String quizId, @RequestBody QuizDto quizDto){
        return ResponseEntity.status(200).body(quizService.updateQuiz(quizId, quizDto));
    }

    @DeleteMapping("/quiz/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String quizId){
        quizService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

}
