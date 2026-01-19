package com.example.quizit.features.question;

import com.example.quizit.dtos.QuestionForUserDto;
import lombok.*;

import java.util.Map;
import java.util.UUID;


@AllArgsConstructor
@Builder
@NoArgsConstructor
@Setter
@Getter
public class QuestionDto {

    private UUID questionId;
    private UUID quizId;
    private String content;
    private Map<String, Object> correctAnswer;
    private Map<String, Object> options;
    private Integer duration;
    private String questionType;
    private DifficultyLevel difficultyLevel;

    private QuestionForUserDto toQuestionForUserDto(QuestionDto dto) {
        QuestionForUserDto userDto = new QuestionForUserDto();
        userDto.setQuestionId(dto.getQuestionId());
        userDto.setQuizId(dto.getQuizId());
        userDto.setContent(dto.getContent());
        userDto.setOptions(dto.getOptions());
        userDto.setDuration(dto.getDuration());
        userDto.setQuestionType(dto.getQuestionType());
        return userDto;
    }
}
