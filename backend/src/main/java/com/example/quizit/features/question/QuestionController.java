package com.example.quizit.features.question;

import com.example.quizit.dtos.QuestionForUserDto;
import com.example.quizit.mapper.QuestionToQuestionUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final QuestionToQuestionUserMapper questionMapper;

    @PostMapping("/question")
    public ResponseEntity<QuestionDto> createQuestion(@RequestBody QuestionDto question) {
//        System.out.println(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(questionService.createQuestion(question));
    }

    @GetMapping("/questions/{quizid}")
    public ResponseEntity<List<QuestionDto>> getQuestionsOfQuiz(@PathVariable String quizid) {
        return ResponseEntity.ok(questionService.getAllQuestionsOfQuiz(quizid));
    }

    @GetMapping("/questionsOnly/{quizId}")
    public ResponseEntity<List<QuestionForUserDto>> getOnlyQuestionsForQuiz(@PathVariable String quizId){
       return ResponseEntity.ok(
               questionService.getAllQuestionsOfQuiz(quizId)
                .stream()
               .map(questionMapper::toUserDto)
               .toList()
       );
    }

    @GetMapping("/question/{uuid}")
    public ResponseEntity<QuestionDto> getQuestion(@PathVariable String uuid) {
        return  ResponseEntity.ok(questionService.getQuestionById(uuid));
    }

    @PutMapping("/question/{uuid}")
    public ResponseEntity<QuestionDto> updateQuestion(@PathVariable String uuid, @RequestBody QuestionDto question) {
        return ResponseEntity.ok(questionService.updateQuestion(uuid,question));
    }

    @DeleteMapping("/question/{uuid}")
    public void deleteQuestion(@PathVariable String uuid) {
        questionService.DeleteQuestion(uuid);
    }
}
