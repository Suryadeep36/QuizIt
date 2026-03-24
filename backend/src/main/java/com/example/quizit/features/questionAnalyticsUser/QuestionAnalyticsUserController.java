package com.example.quizit.features.questionAnalyticsUser;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizit/question-analytics-user")
@RequiredArgsConstructor
public class QuestionAnalyticsUserController {

    private final QuestionAnalyticsUserService questionAnalyticsUserService;

    @PostMapping
    public ResponseEntity<QuestionAnalyticsUserDto> createQuestionAnalyticsUser(
            @RequestBody QuestionAnalyticsUserDto dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionAnalyticsUserService.createQuestionAnalyticsUser(dto));
    }

    @GetMapping("/participant/{participantId}")
    public ResponseEntity<?> getQuestionAnalyticsUsersByParticipantId(
            @PathVariable String participantId) {

        try {
            return ResponseEntity.ok(
                    questionAnalyticsUserService
                            .getQuestionAnalyticsUsersByParticipantId(participantId)
            );
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @GetMapping("/{questionAnalyticsUserId}")
    public ResponseEntity<QuestionAnalyticsUserDto>
    getQuestionAnalyticsUserById(
            @PathVariable String questionAnalyticsUserId) {

        return ResponseEntity.ok(
                questionAnalyticsUserService
                        .getQuestionAnalyticsUserById(questionAnalyticsUserId)
        );
    }

    @GetMapping("/participant/{participantId}/question/{questionId}")
    public ResponseEntity<QuestionAnalyticsUserDto>
    getQuestionAnalyticsUserByParticipantAndQuestion(
            @PathVariable String participantId,
            @PathVariable String questionId) {

        return ResponseEntity.ok(
                questionAnalyticsUserService
                        .getQuestionAnalyticsUserById(participantId, questionId)
        );
    }

    @PutMapping("/{questionAnalyticsUserId}")
    public ResponseEntity<QuestionAnalyticsUserDto>
    updateQuestionAnalyticsUser(
            @PathVariable String questionAnalyticsUserId,
            @RequestBody QuestionAnalyticsUserDto dto) {

        return ResponseEntity.ok(
                questionAnalyticsUserService
                        .updateQuestionAnalyticsUser(questionAnalyticsUserId, dto)
        );
    }

    @PutMapping("/participant/{participantId}/question/{questionId}")
    public ResponseEntity<QuestionAnalyticsUserDto>
    updateQuestionAnalyticsUserByParticipantAndQuestion(
            @PathVariable String participantId,
            @PathVariable String questionId,
            @RequestBody QuestionAnalyticsUserDto dto) {

        return ResponseEntity.ok(
                questionAnalyticsUserService
                        .updateQuestionAnalyticsUser(participantId, questionId, dto)
        );
    }

    @DeleteMapping("/{questionAnalyticsUserId}")
    public ResponseEntity<Void>
    deleteQuestionAnalyticsUser(
            @PathVariable String questionAnalyticsUserId) {

        questionAnalyticsUserService
                .deleteQuestionAnalyticsUser(questionAnalyticsUserId);

        return ResponseEntity.noContent().build();
    }
}
