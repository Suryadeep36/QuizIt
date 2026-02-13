package com.example.quizit.features.quiz.AIQuiz;



import com.example.quizit.features.question.DifficultyLevel;
import com.example.quizit.features.quiz.QuizMode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class QuizGenerationServiceImpl implements QuizGenerationService {

    private final AiQuizClient aiQuizClient;

    // Policy defaults / limits
    private static final int MIN_Q = 5;
    private static final int MAX_Q = 20;
    private static final int DEFAULT_Q = 10;

    private static final int MIN_DURATION = 10;
    private static final int MAX_DURATION = 120;
    private static final int DEFAULT_DURATION = 30;

    private static final DifficultyLevel DEFAULT_DIFFICULTY = DifficultyLevel.NORMAL;

    @Override
    public GenerateQuizResponseDto generateFromPrompt(GenerateQuizRequestDto request) {

        // 1) Ask AI (dummy for now)
        GenerateQuizResponseDto aiResp = aiQuizClient.generate(request.getPrompt());

        // 2) Apply defaults to quiz config
        AiGeneratedQuizDto quiz = Objects.requireNonNull(aiResp.getQuiz(), "AI quiz is null");

        if (quiz.getMode() == null) quiz.setMode(QuizMode.SERVER);
        if (quiz.getAllowGuest() == null) quiz.setAllowGuest(Boolean.TRUE);
        if (quiz.getShuffleQuestions() == null) quiz.setShuffleQuestions(Boolean.TRUE);
        if (quiz.getShowLeaderboard() == null) quiz.setShowLeaderboard(Boolean.TRUE);

        // 3) Validate/clamp questions
        List<AiGeneratedQuestionDto> questions =
                Objects.requireNonNull(aiResp.getQuestions(), "AI questions are null");

        // If AI returns too many, trim
        if (questions.size() > MAX_Q) {
            questions = questions.subList(0, MAX_Q);
        }

        // If too few, fail (better than silently giving bad quiz)
        if (questions.size() < MIN_Q) {
            throw new IllegalStateException("AI generated too few questions: " + questions.size());
        }

        // Apply per-question defaults/clamps
        for (AiGeneratedQuestionDto q : questions) {
            if (q.getDifficultyLevel() == null) q.setDifficultyLevel(DEFAULT_DIFFICULTY);

            Integer dur = q.getDuration();
            if (dur == null) dur = DEFAULT_DURATION;
            q.setDuration(clamp(dur, MIN_DURATION, MAX_DURATION));

            // If allowMultipleAnswers not provided, infer from correctAnswer size
            if (q.getAllowMultipleAnswers() == null) {
                q.setAllowMultipleAnswers(q.getCorrectAnswer() != null && q.getCorrectAnswer().size() > 1);
            }
        }

        // 4) Return final response (use your response dto)
        return GenerateQuizResponseDto.builder()
                .quiz(quiz)
                .questions(questions)
                .provider(aiResp.getProvider() == null ? "dummy" : aiResp.getProvider())
                .model(aiResp.getModel() == null ? "dummy-0" : aiResp.getModel())
                .build();
    }

    private static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}