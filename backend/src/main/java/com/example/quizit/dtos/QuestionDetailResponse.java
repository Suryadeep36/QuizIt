package com.example.quizit.dtos;

import com.example.quizit.features.question.QuestionForUserDto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionDetailResponse {
    QuestionForUserDto questionForUserDto;
    Integer totalQuestions;
    Integer currentQuestionIndex;
}
