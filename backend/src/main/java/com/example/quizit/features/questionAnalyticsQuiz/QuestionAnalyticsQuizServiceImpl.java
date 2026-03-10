package com.example.quizit.features.questionAnalyticsQuiz;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.question.Question;
import com.example.quizit.features.question.QuestionDto;
import com.example.quizit.features.question.QuestionService;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizService;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.features.question.QuestionRepository;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class QuestionAnalyticsQuizServiceImpl implements QuestionAnalyticsQuizService {

    private final QuestionAnalyticsQuizRepository questionAnalyticsQuizRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;
    private final ModelMapper modelMapper;
    private final QuestionService questionService;

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
        Participant fastestParticipantRef = null;

        if (dto.getFastestUserId() != null) {
            fastestParticipantRef = participantRepository.getReferenceById(UUID.fromString(dto.getFastestUserId()));
        }

        QuestionAnalyticsQuiz analytics = QuestionAnalyticsQuiz.builder()
                .quiz(quizRef)
                .question(questionRef)
                .totalAnswered(dto.getTotalAnswered())
                .correctAnswerCount(dto.getCorrectAnswerCount())
                .averageTime(dto.getAverageTime())
                .fastestParticipant(fastestParticipantRef)
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

    //Required
//    @Override
//    public void increaseTotalAnswered(UUID questionId) {
//        questionAnalyticsQuizRepository.incrementTotalAnswerByQuestionId(questionId);
//    }

    @Override
    @Transactional
    public void createAllByQuizId(String quizId, UUID userId) {

        UUID id = UUID.fromString(quizId);

        // 1️⃣ Fetch quiz
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // 2️⃣ Fetch all questions directly (NO security logic)
        List<Question> questions =
                questionRepository.findByQuiz_QuizId(id);

        if (questions.isEmpty()) return;

        // 3️⃣ Fetch existing analytics questionIds
        List<UUID> questionIds = questions.stream()
                .map(Question::getQuestionId)
                .toList();

        List<UUID> existingQuestionIds =
                questionAnalyticsQuizRepository.findExistingQuestionIds(questionIds);

        // 4️⃣ Create analytics only for missing ones
        List<QuestionAnalyticsQuiz> analyticsList =
                questions.stream()
                        .filter(q -> !existingQuestionIds.contains(q.getQuestionId()))
                        .map(q -> QuestionAnalyticsQuiz.builder()
                                .quiz(quiz)
                                .question(q)
                                .totalAnswered(0)
                                .correctAnswerCount(0)
                                .averageTime(0L)
                                .fastestParticipant(null)
                                .build()
                        )
                        .toList();

        if (!analyticsList.isEmpty()) {
            questionAnalyticsQuizRepository.saveAll(analyticsList);
        }
    }



    @Override
    @Transactional
    public void calculateAfterQuiz(UUID quizId, UUID userId) {

        // 1️⃣ Fetch quiz
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        // 2️⃣ Fetch all questions directly
        List<Question> questions =
                questionRepository.findByQuiz_QuizId(quizId);

        if (questions.isEmpty()) return;

        for (Question question : questions) {

            UUID questionId = question.getQuestionId();

            // 3️⃣ Aggregate from QuestionAnalyticsUser
            Integer totalAnswered =
                    questionAnalyticsQuizRepository.countTotalAnswered(quizId, questionId);

            Integer correctCount =
                    questionAnalyticsQuizRepository.countCorrectAnswers(quizId, questionId);

            Long avgTime =
                    questionAnalyticsQuizRepository.calculateAverageTime(quizId, questionId);

            Participant fastest =
                    questionAnalyticsQuizRepository
                            .findFastestParticipant(
                                    quizId,
                                    questionId,
                                    PageRequest.of(0, 1)
                            )
                            .stream()
                            .findFirst()
                            .orElse(null);

            // 4️⃣ Get existing analytics row OR create new one safely
            QuestionAnalyticsQuiz qaq =
                    questionAnalyticsQuizRepository
                            .findByQuestion_QuestionId(questionId)
                            .orElseGet(() ->
                                    QuestionAnalyticsQuiz.builder()
                                            .quiz(quiz)
                                            .question(question)
                                            .totalAnswered(0)
                                            .correctAnswerCount(0)
                                            .averageTime(0L)
                                            .fastestParticipant(null)
                                            .build()
                            );

            // 5️⃣ Update values safely (handle nulls)
            qaq.setTotalAnswered(totalAnswered != null ? totalAnswered : 0);
            qaq.setCorrectAnswerCount(correctCount != null ? correctCount : 0);
            qaq.setAverageTime(avgTime != null ? avgTime : 0L);
            qaq.setFastestParticipant(fastest);

            questionAnalyticsQuizRepository.save(qaq);
        }
    }



    @Override
    public List<QuestionWithAnalyticsDto> getDetailedAnalyticsByQuizId(String quizId) {

        UUID id = UserHelper.parseUUID(quizId);

        // 1️⃣ Fetch analytics
        List<QuestionAnalyticsQuiz> analyticsList =
                questionAnalyticsQuizRepository
                        .findAllByQuiz_QuizId(id);

        if (analyticsList.isEmpty()) return List.of();

        // 2️⃣ Convert analytics to DTO
        List<QuestionAnalyticsQuizDto> analyticsDtos =
                analyticsList.stream()
                        .map(qaq -> QuestionAnalyticsQuizDto.builder()
                                .qaqId(qaq.getQaqId())
                                .quizId(qaq.getQuiz().getQuizId())
                                .questionId(qaq.getQuestion().getQuestionId())
                                .totalAnswered(qaq.getTotalAnswered())
                                .correctAnswerCount(qaq.getCorrectAnswerCount())
                                .averageTime(qaq.getAverageTime())
                                .fastestUserId(
                                        qaq.getFastestParticipant() != null
                                                ? qaq.getFastestParticipant().getParticipantName()
                                                : null
                                )
                                .build()
                        )
                        .toList();

        // 3️⃣ Fetch QuestionDtos
        List<QuestionDto> questionDtos =
                questionService.getAllQuestionsOfQuiz(quizId, null);

        Map<UUID, QuestionDto> questionMap =
                questionDtos.stream()
                        .collect(Collectors.toMap(
                                QuestionDto::getQuestionId,
                                q -> q
                        ));

        // 4️⃣ Combine
        return analyticsDtos.stream()
                .map(analytics -> {

                    QuestionDto question =
                            questionMap.get(analytics.getQuestionId());

                    double accuracy = 0.0;

                    if (analytics.getTotalAnswered() != null &&
                            analytics.getTotalAnswered() > 0) {

                        accuracy =
                                (analytics.getCorrectAnswerCount() * 100.0)
                                        / analytics.getTotalAnswered();
                    }

                    return QuestionWithAnalyticsDto.builder()
                            .question(question)
                            .analytics(analytics)
                            .accuracyPercentage(accuracy)
                            .build();
                })
                .toList();
    }


}
