package com.example.quizit.features.question;

import java.util.List;
import java.util.UUID;

public interface QuestionService {

    QuestionDto getQuestionById(String QuestionId, UUID userId);
    QuestionDto createQuestion(QuestionDto questionDto, UUID userId);
    QuestionDto updateQuestion(String QuestionId, QuestionDto questionDto, UUID userId);
    void DeleteQuestion(String QuestionId, UUID userId);
    List<QuestionDto> getAllQuestionsOfQuiz(String quizId, UUID userId);
    public List<QuestionForUserDto> getLiveQuestions(UUID quizId);
}
