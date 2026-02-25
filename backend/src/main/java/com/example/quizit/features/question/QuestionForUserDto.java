package com.example.quizit.features.question;

import com.example.quizit.features.question.QuestionType;
import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class QuestionForUserDto {

    private UUID questionId;
    private UUID quizId;
    private String content;
    private Map<String, Object> options;
    private Integer duration;
    private QuestionType questionType;
    private String imageUrl;
    private Boolean caseSensitive;
    private Integer maxAnswerLength;
    private Boolean allowMultipleAnswers;
    private Integer displayOrder;

}
