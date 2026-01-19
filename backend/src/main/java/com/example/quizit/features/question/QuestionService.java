package com.example.quizit.features.question;

import java.util.List;

public interface QuestionService {

    QuestionDto getQuestionById(String uuid);
    QuestionDto createQuestion(QuestionDto questionDto);
    QuestionDto updateQuestion(String uuid,QuestionDto questionDto);
    void DeleteQuestion(String uuid);
    List<QuestionDto> getAllQuestionsOfQuiz(String quizId);
}
