package com.example.quizit.features.question;

import com.example.quizit.features.user.User;
import com.example.quizit.mapper.QuestionToQuestionUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final QuestionToQuestionUserMapper questionMapper;

    @PostMapping("/question")
    public ResponseEntity<QuestionDto> createQuestion(@RequestBody QuestionDto question, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.createQuestion(question,user.getId()));
    }

    @GetMapping("/questions/{quizid}")
    public ResponseEntity<List<QuestionDto>> getQuestionsOfQuiz(@PathVariable String quizid,@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(questionService.getAllQuestionsOfQuiz(quizid,user.getId()));
    }

    @GetMapping("/quiz/{quizId}/questions-only")
    public ResponseEntity<List<QuestionForUserDto>> getQuestionsForQuiz(
            @PathVariable UUID quizId) {

        return ResponseEntity.ok(
                questionService.getLiveQuestions(quizId)
        );
    }


    @GetMapping("/question/{questionId}")
    public ResponseEntity<QuestionDto> getQuestion(@PathVariable String questionId,@AuthenticationPrincipal User user) {
        return  ResponseEntity.ok(questionService.getQuestionById(questionId,user.getId()));
    }

    @PutMapping("/question/{questionId}")
    public ResponseEntity<QuestionDto> updateQuestion(@PathVariable String questionId,
                                                      @RequestBody QuestionDto question,
                                                      @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(questionService.updateQuestion(questionId,question,user.getId()));
    }

    @DeleteMapping("/question/{questionId}")
    public void deleteQuestion(@PathVariable String questionId, @AuthenticationPrincipal User user) {
        questionService.DeleteQuestion(questionId,user.getId());
    }
}
