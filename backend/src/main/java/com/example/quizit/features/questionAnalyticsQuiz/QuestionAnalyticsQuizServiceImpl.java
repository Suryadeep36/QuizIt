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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.awt.print.Pageable;
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
    private final QuizService quizService;
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
            fastestParticipantRef = participantRepository.getReferenceById(dto.getFastestUserId());
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
        UUID id  = UUID.fromString(quizId);
        List<QuestionDto> questionDtos =
                questionService.getAllQuestionsOfQuiz(quizId, userId);

        if (questionDtos.isEmpty()) return;

        Quiz quizRef = quizRepository.getReferenceById(id);

        // 1️⃣ Extract all questionIds
        List<UUID> questionIds = questionDtos.stream()
                .map(QuestionDto::getQuestionId)
                .toList();

        // 2️⃣ Fetch existing QAQ questionIds in ONE query
        List<UUID> existingQuestionIds =
                questionAnalyticsQuizRepository.findExistingQuestionIds(questionIds);

        // 3️⃣ Filter only new ones
        List<QuestionAnalyticsQuiz> analyticsList = questionDtos.stream()
                .filter(dto -> !existingQuestionIds.contains(dto.getQuestionId()))
                .map(dto -> QuestionAnalyticsQuiz.builder()
                        .quiz(quizRef)
                        .question(
                                questionRepository.getReferenceById(dto.getQuestionId())
                        )
                        .averageTime(0)
                        .totalAnswered(0)
                        .correctAnswerCount(0)
                        .fastestParticipant(null)
                        .build()
                )
                .toList();

        if (!analyticsList.isEmpty()) {
            questionAnalyticsQuizRepository.saveAll(analyticsList);
        }
    }

    @Transactional
    @Override
    public void calculateAfterQuiz(UUID quizId,UUID  userId) {

        // 1️⃣ Get all questions via service
        List<QuestionDto> questions =
                questionService.getAllQuestionsOfQuiz(quizId.toString(), userId);

        if (questions.isEmpty()) return;

        for (QuestionDto questionDto : questions) {

            UUID questionId = questionDto.getQuestionId();

            // 2️⃣ Aggregate from QuestionAnalyticsUser
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
                                    (Pageable) PageRequest.of(0, 1)
                            )
                            .stream()
                            .findFirst()
                            .orElse(null);

            // 3️⃣ Update QuestionAnalyticsQuiz
            QuestionAnalyticsQuiz qaq =
                    questionAnalyticsQuizRepository
                            .findByQuestion_QuestionId(questionId)
                            .orElseThrow();

            qaq.setTotalAnswered(totalAnswered);
            qaq.setCorrectAnswerCount(correctCount);
            qaq.setAverageTime(avgTime);
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
                                                ? qaq.getFastestParticipant().getParticipantId()
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
