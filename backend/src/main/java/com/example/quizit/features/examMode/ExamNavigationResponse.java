package com.example.quizit.features.examMode;

import com.example.quizit.features.question.QuestionForUserDto;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Setter
@Getter
@Data
@Builder
public class ExamNavigationResponse {
    private QuestionForUserDto question;
    private int currentIndex;
    private int totalQuestions;
    private long remainingTimeMillis;
    private long globalRemainingTimeMillis;
    private Map<String, Object> selectedAnswer;
    private String status;
}
