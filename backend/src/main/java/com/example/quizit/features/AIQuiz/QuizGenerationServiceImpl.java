package com.example.quizit.features.AIQuiz;

import com.example.quizit.features.question.DifficultyLevel;
import com.example.quizit.features.question.QuestionDto;
import com.example.quizit.features.question.QuestionService;
import com.example.quizit.features.AIQuiz.clients.AiQuizClient;
import com.example.quizit.features.quiz.QuizMode;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizGenerationServiceImpl implements QuizGenerationService {

    private final AiQuizClient aiQuizClient;
    private final ModelMapper modelMapper;
    private final QuestionService questionService;
    // Policy defaults / limits
    private static final int MIN_Q = 1;
    private static final int MAX_Q = 20;
    private static final int DEFAULT_DURATION = 30;
    private static final int MIN_DURATION = 10;
    private static final int MAX_DURATION = 120;
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final DifficultyLevel DEFAULT_DIFFICULTY = DifficultyLevel.NORMAL;

    @Transactional
    @Override
    public GenerateQuizResponseDto generateFromPrompt(
            GenerateQuizRequestDto request, UUID quizId, UUID userId) throws JsonProcessingException {

        // 1️⃣ Call AI
        GenerateQuizResponseDto aiResp =
                aiQuizClient.generate(request.getPrompt());


         List<QuestionDto> questions= Objects.requireNonNull(aiResp.getQuestions(), "AI questions are null");

        List<QuestionDto> validQuestions = new ArrayList<>();

        // 2️⃣ Convert + Validate
        for (QuestionDto aiQ : questions) {

            try {

                applyQuestionDefaults(aiQ);
                aiQ.setQuizId(quizId);
                aiQ.setIsAIGenerated(true);
                if (isValidQuestion(aiQ)) {
                    validQuestions.add(aiQ);
                }

            } catch (Exception ex) {
                log.warn("Dropped invalid AI question: {}", aiQ.getContent());
            }
        }

        // 3️⃣ Enforce limits
        if (validQuestions.size() > MAX_Q) {
            validQuestions = List.copyOf(validQuestions.subList(0, MAX_Q));
        }

        if (validQuestions.size() < MIN_Q) {
            throw new IllegalStateException(
                    "AI generated insufficient valid questions. Found: "
                            + validQuestions.size()
            );
        }

        // 4️⃣ Persist
        questionService.createQuestion(validQuestions, userId);

        // 5️⃣ Return
        return GenerateQuizResponseDto.builder()
                .quiz(aiResp.getQuiz())
                .questions(validQuestions)
                .provider(aiResp.getProvider())
                .model(aiResp.getModel())
                .build();
    }

    // -------------------------------------------------
    // DEFAULT HANDLING
    // -------------------------------------------------

    private void applyQuizDefaults(AiGeneratedQuizDto quiz) {

        if (quiz.getMode() == null)
            quiz.setMode(QuizMode.SERVER);

        if (quiz.getAllowGuest() == null)
            quiz.setAllowGuest(true);

        if (quiz.getShuffleQuestions() == null)
            quiz.setShuffleQuestions(true);

        if (quiz.getShowLeaderboard() == null)
            quiz.setShowLeaderboard(true);
    }

    private void applyQuestionDefaults(QuestionDto q) {

        if (q.getDifficultyLevel() == null)
            q.setDifficultyLevel(DEFAULT_DIFFICULTY);

        Integer dur = q.getDuration();
        if (dur == null) dur = DEFAULT_DURATION;

        q.setDuration(clamp(dur, MIN_DURATION, MAX_DURATION));

        // Infer allowMultipleAnswers
        if (q.getCorrectAnswer() != null) {
            q.setAllowMultipleAnswers(q.getCorrectAnswer().size() > 1);
        } else {
            q.setAllowMultipleAnswers(false);
        }
    }

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    private boolean isValidQuestion(QuestionDto q) {

        if (q.getContent() == null || q.getContent().isBlank())
            return false;

        if (q.getQuestionType() == null)
            return false;

        switch (q.getQuestionType()) {

            case MCQ -> {
                return q.getOptions() != null
                        && q.getOptions().size() >= 2
                        && q.getCorrectAnswer() != null
                        && !q.getCorrectAnswer().isEmpty();
            }

            case TRUE_FALSE -> {
                return q.getOptions() != null
                        && q.getOptions().containsKey("TRUE")
                        && q.getOptions().containsKey("FALSE")
                        && q.getCorrectAnswer() != null
                        && q.getCorrectAnswer().size() == 1;
            }

            case SHORT_ANSWER, NUMERICAL -> {
                return q.getCorrectAnswer() != null
                        && !q.getCorrectAnswer().isEmpty();
            }

            case MATCH_FOLLOWING -> {
                return q.getOptions() != null
                        && q.getOptions().containsKey("left")
                        && q.getOptions().containsKey("right")
                        && q.getCorrectAnswer() != null
                        && !q.getCorrectAnswer().isEmpty()
                        && q.getCorrectAnswer().get(0).getMatchPairs() != null;
            }

            default -> {
                return false;
            }
        }
    }

    // -------------------------------------------------

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
