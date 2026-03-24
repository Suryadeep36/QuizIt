package com.example.quizit.features.quiz;

import java.util.List;
import java.util.UUID;

public interface QuizService {

    QuizDto createQuiz(QuizDto quizDto,UUID userId);
    QuizDto updateQuiz(String quizId, QuizDto quizDto,UUID userId);
    QuizDto getQuizById(String quizId, UUID userId);
    QuizDtoForParticipant getQuizForParticipantById(String quizId);
    List<QuizDto> getQuizzesByHost(String hostId);
    List<QuizDto> getAllQuizzes();
    void deleteQuiz(String quizId ,UUID userId);
    public void endQuiz(UUID quizId);
    void scheduleQuizEnd(Quiz quiz);
    void endQuizEarly(UUID quizId);
    void endQuizEarlyByHost(UUID quizId, UUID hostId);
    void publishResult(UUID quizId, UUID hostId);
  }
