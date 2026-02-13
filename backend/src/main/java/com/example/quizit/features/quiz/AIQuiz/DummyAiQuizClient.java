package com.example.quizit.features.quiz.AIQuiz;


import com.example.quizit.features.question.DifficultyLevel;
import com.example.quizit.features.quiz.QuizMode;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Primary
public class DummyAiQuizClient implements AiQuizClient {

    @Override
    public GenerateQuizResponseDto generate(String prompt) {
        return GenerateQuizResponseDto.builder()
                .provider("dummy")
                .model("dummy-0")
                .quiz(AiGeneratedQuizDto.builder()
                        .quizName("AI Quiz (Dummy)")
                        .mode(QuizMode.SERVER)
                        .allowGuest(true)
                        .shuffleQuestions(true)
                        .showLeaderboard(true)
                        .build())
                .questions(List.of(
                        AiGeneratedQuestionDto.builder()
                                .content("Dummy Q1: What is TCP?")
//                                .questionType(QuestionType.MCQ)
                                .difficultyLevel(DifficultyLevel.EASY)
                                .duration(30)
                                .options(Map.of(
                                        "A", "A transport-layer protocol",
                                        "B", "A routing protocol",
                                        "C", "An encryption algorithm",
                                        "D", "A physical cable"
                                ))
                                .correctAnswer(List.of(AnswerKey.A))
                                .allowMultipleAnswers(false)
                                .build(),

                        AiGeneratedQuestionDto.builder()
                                .content("Dummy Q2: UDP is connectionless. True/False?")
//                                .questionType(QuestionType.TRUE_FALSE)
                                .difficultyLevel(DifficultyLevel.EASY)
                                .duration(20)
                                .options(Map.of(
                                        "A", "True",
                                        "B", "False"
                                ))
                                .correctAnswer(List.of(AnswerKey.A))
                                .allowMultipleAnswers(false)
                                .build(),

                        AiGeneratedQuestionDto.builder()
                                .content("Dummy Q3: Name one use-case of UDP.")
//                                .questionType(QuestionType.SHORT_ANSWER)
                                .difficultyLevel(DifficultyLevel.NORMAL)
                                .duration(45)
                                .caseSensitive(false)
                                .acceptableAnswers(List.of("dns", "online gaming", "video streaming"))
                                .maxAnswerLength(100)
                                .allowMultipleAnswers(false)
                                .build(),

                        AiGeneratedQuestionDto.builder()
                                .content("Dummy Q4: What does congestion control try to reduce?")
//                                .questionType(QuestionType.MCQ)
                                .difficultyLevel(DifficultyLevel.HARD)
                                .duration(30)
                                .options(Map.of(
                                        "A", "Network congestion / overload",
                                        "B", "Encryption time",
                                        "C", "CPU temperature",
                                        "D", "File size"
                                ))
                                .correctAnswer(List.of(AnswerKey.A))
                                .allowMultipleAnswers(false)
                                .build(),

                        AiGeneratedQuestionDto.builder()
                                .content("Dummy Q5: In TCP, ACK stands for?")
//                                .questionType(QuestionType.MCQ)
                                .difficultyLevel(DifficultyLevel.EASY)
                                .duration(25)
                                .options(Map.of(
                                        "A", "Acknowledgement",
                                        "B", "Access Key",
                                        "C", "Active Kernel",
                                        "D", "Any Key"
                                ))
                                .correctAnswer(List.of(AnswerKey.A))
                                .allowMultipleAnswers(false)
                                .build()
                ))
                .build();
    }
}