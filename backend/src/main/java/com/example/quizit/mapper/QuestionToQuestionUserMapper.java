package com.example.quizit.mapper;

import com.example.quizit.features.question.QuestionDto;
import com.example.quizit.dtos.QuestionForUserDto;
import org.springframework.stereotype.Component;

@Component
public class QuestionToQuestionUserMapper {
    public QuestionForUserDto toUserDto(QuestionDto dto) {
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
