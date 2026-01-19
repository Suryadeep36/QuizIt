package com.example.quizit.features.questionAnalyticsQuiz;

import com.example.quizit.features.question.Question;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.user.User;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.features.question.QuestionRepository;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class QuestionAnalyticsQuizServiceImpl implements QuestionAnalyticsQuizService {

    private final QuestionAnalyticsQuizRepository questionAnalyticsQuizRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public QuestionAnalyticsQuizDto createQuestionAnalytics(QuestionAnalyticsQuizDto dto) {
        if (dto.getQuizId() == null || dto.getQuestionId() == null) {
            throw new ResourceNotFoundException("Quiz ID and Question ID are required");
        }
        if(questionAnalyticsQuizRepository.existsByQuestion_QuestionId(dto.getQuestionId())){
            throw new IllegalArgumentException("Question Analytics for the given quiz id already exists");
        }
        Quiz quizRef = quizRepository.getReferenceById(dto.getQuizId());
        Question questionRef = questionRepository.getReferenceById(dto.getQuestionId());
        User fastestUserRef = null;

        if (dto.getFastestUserId() != null) {
            fastestUserRef = userRepository.getReferenceById(dto.getFastestUserId());
        }

        QuestionAnalyticsQuiz analytics = QuestionAnalyticsQuiz.builder()
                .quiz(quizRef)
                .question(questionRef)
                .totalAnswered(dto.getTotalAnswered())
                .correctAnswerCount(dto.getCorrectAnswerCount())
                .averageTime(dto.getAverageTime())
                .fastestUser(fastestUserRef)
                .build();

        QuestionAnalyticsQuiz savedAnalytics = questionAnalyticsQuizRepository.save(analytics);
        return modelMapper.map(savedAnalytics, QuestionAnalyticsQuizDto.class);
    }

    @Override
    public QuestionAnalyticsQuizDto getQuestionAnalyticsByQuestionId(String questionId) {
        UUID questionUUID = UUID.fromString(questionId);
        QuestionAnalyticsQuiz analytics = questionAnalyticsQuizRepository
                .getQuestionAnalyticsQuizByQuestion_QuestionId(questionUUID)
                .orElseThrow(() -> new ResourceNotFoundException("Question analytics not found"));
        return modelMapper.map(analytics, QuestionAnalyticsQuizDto.class);
    }

    @Override
    public List<QuestionAnalyticsQuizDto> getAnalyticsByQuizId(String quizId) {
        return questionAnalyticsQuizRepository
                .getQuestionAnalyticsQuizByQuiz_QuizId(UserHelper.parseUUID(quizId))
                .stream()
                .map(questionAnalyticsQuiz -> modelMapper.map(questionAnalyticsQuiz, QuestionAnalyticsQuizDto.class))
                .toList();
    }

    @Override
    public List<QuestionAnalyticsQuizDto> getAllQuestionAnalytics() {
        return questionAnalyticsQuizRepository.findAll()
                .stream()
                .map(a -> modelMapper.map(a, QuestionAnalyticsQuizDto.class))
                .collect(Collectors.toList());
    }
}
