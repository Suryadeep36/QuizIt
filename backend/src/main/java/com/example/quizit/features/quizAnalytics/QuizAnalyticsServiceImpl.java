package com.example.quizit.features.quizAnalytics;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.user.User;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class QuizAnalyticsServiceImpl implements QuizAnalyticsService {

    private final QuizAnalyticsRepository quizAnalyticsRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public QuizAnalyticsDto createQuizAnalytics(QuizAnalyticsDto dto) {

        if (dto.getQuizId() == null || dto.getWinnerUserId() == null) {
            throw new IllegalArgumentException("Quiz ID and Winner User ID are required");
        }

        if (quizAnalyticsRepository.findQuizAnalyticsByQuiz_QuizId(dto.getQuizId()).isPresent()) {
            throw new IllegalStateException("Analytics already exists for this quiz");
        }

        Quiz quizRef = quizRepository.getReferenceById(dto.getQuizId());
        User userRef = userRepository.getReferenceById(dto.getWinnerUserId());

        System.out.println(quizRef.getQuizId());
        System.out.println(userRef.getId());
        QuizAnalytics quizAnalytics = QuizAnalytics.builder()
                .quiz(quizRef)
                .winnerUser(userRef)
                .averageScore(dto.getAverageScore())
                .totalDuration(dto.getTotalDuration())
                .build();

        QuizAnalytics saved = quizAnalyticsRepository.save(quizAnalytics);

        return modelMapper.map(saved, QuizAnalyticsDto.class);
    }

    @Override
    public QuizAnalyticsDto getAnalyticsByQuizId(String quizId) {

        UUID quizUUID = UserHelper.parseUUID(quizId);

        QuizAnalytics analytics = quizAnalyticsRepository.findQuizAnalyticsByWinnerUser_Id(quizUUID)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Analytics not found for quiz"));

        return modelMapper.map(analytics, QuizAnalyticsDto.class);
    }

    @Override
    public List<QuizAnalyticsDto> getAllAnalytics() {
        return quizAnalyticsRepository.findAll()
                .stream()
                .map(a -> modelMapper.map(a, QuizAnalyticsDto.class))
                .toList();
    }

    @Override
    public List<QuizAnalyticsDto> getAnalyticsByWinnerUser(String userId) {
        UUID userUUID = UserHelper.parseUUID(userId);

        return quizAnalyticsRepository.findQuizAnalyticsByWinnerUser_Id(userUUID)
                .stream()
                .map(a -> modelMapper.map(a, QuizAnalyticsDto.class))
                .toList();
    }
}

