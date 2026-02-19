package com.example.quizit.features.question;

import com.example.quizit.features.quiz.QuizDto;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@Builder
@NoArgsConstructor
@Setter
@Getter
public class CreateQuestionListDto {
   private List<QuestionDto> questionList;
}
