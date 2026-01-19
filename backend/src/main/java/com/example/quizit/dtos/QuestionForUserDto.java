package com.example.quizit.dtos;

import lombok.*;

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
    private String questionType;

}
