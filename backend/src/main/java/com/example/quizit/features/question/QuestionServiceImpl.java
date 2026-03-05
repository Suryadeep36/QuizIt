package com.example.quizit.features.question;

import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.quiz.QuizStatus;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.mapper.QuestionToQuestionUserMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class QuestionServiceImpl implements QuestionService {
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final ModelMapper modelMapper;
    private final QuestionToQuestionUserMapper questionMapper;
    private static Integer counter = 0;
    @Override
    public QuestionDto getQuestionById(String QuestionId, UUID userId) {

        UUID id = UUID.fromString(QuestionId);
        Question question = questionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Question with id " + id + " not found"));

        UUID quizId = question.getQuiz().getQuizId();
        if(!quizRepository.existsByQuizIdAndHostId(quizId, userId))
            throw new ResourceNotFoundException("Quiz not found");

        return modelMapper.map(question, QuestionDto.class);
    }

    @Override
    public List<QuestionDto> getAllQuestionsOfQuiz(String quizId, UUID userId) {
        UUID id = UserHelper.parseUUID(quizId);
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Quiz not found")
                );

        // Rule 1: If ENDED → allow anyone
        if (quiz.getStatus() == QuizStatus.ENDED) {

            return questionRepository.findByQuiz_QuizId(id)
                    .stream()
                    .map(q -> modelMapper.map(q, QuestionDto.class))
                    .toList();
        }

        // Rule 2: If not ENDED → only owner allowed
        if (!quiz.getHost().getId().equals(userId)) {
            throw new ResourceNotFoundException("Quiz not found");
        }

        return questionRepository.findByQuiz_QuizIdOrderByDisplayOrder(id)
                .stream()
                .map(q -> modelMapper.map(q, QuestionDto.class))
                .toList();
    }

    @Override
    public List<QuestionForUserDto> getLiveQuestions(UUID quizId) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Quiz not found")
                );

        Instant now = Instant.now();

        // 1️⃣ Check start time
        if (now.isBefore(quiz.getStartTime())) {
            throw new ResourceNotFoundException("Quiz not started yet");
        }



        return questionRepository.findByQuiz_QuizId(quizId)
                .stream()
                .map(question -> modelMapper.map(question, QuestionDto.class))
                .map(questionMapper::toUserDto)  // must NOT include correctAnswer
                .toList();
    }


    public QuestionDto createQuestion(QuestionDto questionDto, UUID userId) {
        if (questionDto.getQuizId() == null) {
            throw new IllegalArgumentException("Quiz ID is required");
        }

        if (questionDto.getCorrectAnswer() == null) {
            throw new IllegalArgumentException("Correct answer is required");
        }

        if (questionDto.getDuration() == null) {
            throw new IllegalArgumentException("Duration is required");
        }
        if (!questionDto.getAllowMultipleAnswers() &&
                questionDto.getCorrectAnswer().size() > 1) {
            throw new IllegalArgumentException(
                    "Multiple correct answers not allowed"
            );
        }

        Quiz quiz = quizRepository
                .findByQuizIdAndHostId(questionDto.getQuizId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        Integer maxOrder = questionRepository
                .findMaxDisplayOrderByQuizId(questionDto.getQuizId());

        int nextOrder = (maxOrder == null) ? 10 : maxOrder + 10;

        Question question = modelMapper.map(questionDto, Question.class);

        question.setQuiz(quiz);
        question.setIsAIGenerated(false);
        question.setDisplayOrder(nextOrder);
        Question savedQuestion = questionRepository.save(question);
        return modelMapper.map(savedQuestion, QuestionDto.class);
    }

    @Override
    @Transactional
    public List<QuestionDto> createQuestion(List<QuestionDto> questionList, UUID userId) {

        if (questionList == null || questionList.isEmpty()) {
            throw new IllegalArgumentException("Question list cannot be empty");
        }

        UUID quizId = questionList.get(0).getQuizId();

        if (quizId == null) {
            throw new IllegalArgumentException("Quiz ID is required");
        }

        Quiz quiz = quizRepository
                .findByQuizIdAndHostId(quizId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        Integer maxOrder = questionRepository
                .findMaxDisplayOrderByQuizId(quizId);

        int nextOrder = (maxOrder == null) ? 10 : maxOrder + 10;

        List<Question> questionEntities = new ArrayList<>();

        for (QuestionDto questionDto : questionList) {

            if (!quizId.equals(questionDto.getQuizId())) {
                throw new IllegalArgumentException("All questions must belong to same quiz");
            }

            if (questionDto.getCorrectAnswer() == null) {
                throw new IllegalArgumentException("Correct answer is required");
            }

            if (questionDto.getDuration() == null) {
                throw new IllegalArgumentException("Duration is required");
            }

            boolean allowMultiple =
                    Boolean.TRUE.equals(questionDto.getAllowMultipleAnswers());

            if (!allowMultiple &&
                    questionDto.getCorrectAnswer().size() > 1) {
                throw new IllegalArgumentException("Multiple correct answers not allowed");
            }

            Question question = modelMapper.map(questionDto, Question.class);

            question.setQuiz(quiz);
            question.setIsAIGenerated(false);
            question.setDisplayOrder(nextOrder);
            nextOrder += 10;

            questionEntities.add(question);
        }

        List<Question> savedQuestions =
                questionRepository.saveAll(questionEntities);

        return savedQuestions.stream()
                .map(q -> modelMapper.map(q, QuestionDto.class))
                .toList();
    }



    @Override
    public QuestionDto updateQuestion(String QuestionId, QuestionDto questionDto, UUID userId) {

        if (questionDto == null) {
            throw new ResourceNotFoundException();
        }
        System.out.println(questionDto.getCorrectAnswer());
        UUID uuid = UserHelper.parseUUID(QuestionId);

        Question existingQuestion = questionRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found!"));

        UUID quizId = existingQuestion.getQuiz().getQuizId();
        if(!quizRepository.existsByQuizIdAndHostId(quizId, userId))
            throw new ResourceNotFoundException("Quiz not found");


        if (questionDto.getQuizId() != null) {
            Quiz quiz = quizRepository.findById(questionDto.getQuizId())
                    .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
            existingQuestion.setQuiz(quiz);
        }

        if (questionDto.getAllowMultipleAnswers() != null) {
            existingQuestion.setAllowMultipleAnswers(
                    questionDto.getAllowMultipleAnswers()
            );
        }

        if (questionDto.getCorrectAnswer() != null) {
            existingQuestion.setCorrectAnswer(
                    questionDto.getCorrectAnswer()
            );
        }

        if (Boolean.FALSE.equals(existingQuestion.getAllowMultipleAnswers())
                && existingQuestion.getCorrectAnswer() != null
                && existingQuestion.getCorrectAnswer().size() > 1) {

            throw new IllegalArgumentException(
                    "Multiple correct answers not allowed"
            );
        }

        if (questionDto.getDuration() != null) {
            existingQuestion.setDuration(questionDto.getDuration());
        }
        if (questionDto.getContent() != null) {
            existingQuestion.setContent(questionDto.getContent());
        }
        if (questionDto.getQuestionType() != null) {
            existingQuestion.setQuestionType(questionDto.getQuestionType());
        }
        if (questionDto.getDifficultyLevel() != null) {
            existingQuestion.setDifficultyLevel(questionDto.getDifficultyLevel());
        }
        if (questionDto.getOptions() != null) {
            existingQuestion.setOptions(questionDto.getOptions());
        }
        if (questionDto.getCaseSensitive() != null) {
            existingQuestion.setCaseSensitive(questionDto.getCaseSensitive());
        }
        if (questionDto.getImageUrl() != null) {
            existingQuestion.setImageUrl(questionDto.getImageUrl());
        }
        if (questionDto.getAcceptableAnswers() != null) {
            existingQuestion.setAcceptableAnswers(questionDto.getAcceptableAnswers());
        }
        if (questionDto.getMaxAnswerLength() != null) {
            existingQuestion.setMaxAnswerLength(questionDto.getMaxAnswerLength());
        }

        Question savedQuestion = questionRepository.save(existingQuestion);
        return modelMapper.map(savedQuestion, QuestionDto.class);
    }

    @Override
    public void DeleteQuestion(String uuid, UUID userId) {

        UUID id = UserHelper.parseUUID(uuid);
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found!"));

        UUID quizId = question.getQuiz().getQuizId();
        if(!quizRepository.existsByQuizIdAndHostId(quizId, userId))
            throw new ResourceNotFoundException("Quiz not found");

        questionRepository.delete(question);
    }
}
