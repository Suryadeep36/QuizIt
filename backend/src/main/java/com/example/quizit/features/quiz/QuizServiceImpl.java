package com.example.quizit.features.quiz;


import com.example.quizit.features.allowedUser.AllowedUserSerivce;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.participantPerformance.ParticipantPerformance;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.participantPerformance.ParticipantPerformanceRepository;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUserRepository;
import com.example.quizit.features.quizSession.QuizSession;
import com.example.quizit.features.quizSession.QuizSessionRepository;
import com.example.quizit.features.user.UserRepository;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.records.ParticipantAntiCheatState;
import com.example.quizit.services.QuizAntiCheatService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {


    private final QuizRepository quizRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;
    private final ParticipantPerformanceRepository participantPerformanceRepository;
    private final QuestionAnalyticsUserRepository questionAnalyticsUserRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final QuizAntiCheatService quizAntiCheatService;
    private final AllowedUserSerivce allowedUserSerivce;
    private void validateQuizTimeWindow(Instant startTime, Instant endTime) {

        if (startTime == null || endTime == null) {
            return;
        }

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Duration duration = Duration.between(startTime, endTime);

        if (duration.toDays() > 3) {
            throw new IllegalArgumentException(
                    "Quiz duration cannot exceed 3 days"
            );
        }
    }


    @Override
    public QuizDto createQuiz(QuizDto quizDto,UUID userId) {

        if (quizDto == null || quizDto.getQuizName() == null || userId == null) {
            throw new IllegalArgumentException("Quiz name and host are required");
        }

        validateQuizTimeWindow(
                quizDto.getStartTime(),
                quizDto.getEndTime()
        );

        if (quizRepository.existsByQuizNameAndHostId(
                quizDto.getQuizName(), userId)) {
            throw new IllegalArgumentException("Quiz already exists");
        }

        Quiz quiz = new Quiz();
        quiz.setStatus(QuizStatus.CREATED);
        quiz.setCreatedAt(Instant.now());
        quiz.setQuizName(quizDto.getQuizName());
        quiz.setMode(quizDto.getMode());
        quiz.setStartTime(quizDto.getStartTime());
        quiz.setEndTime(quizDto.getEndTime());
        quiz.setAllowGuest(quizDto.isAllowGuest());
        quiz.setShuffleQuestions(quizDto.isShuffleQuestions());
        quiz.setShowLeaderboard(quizDto.isShowLeaderboard());
        quiz.setAllowGuest(quizDto.isAllowGuest());
        quiz.setAllowAllAuthenticated(quizDto.isAllowAllAuthenticated());
        quiz.setHost(
                userRepository.getReferenceById(userId)
        );
        Quiz savedQuiz = quizRepository.save(quiz);

        if (quiz.getMode() == QuizMode.EXAM
                && !quiz.isAllowAllAuthenticated()
                && quizDto.getAllowedEmails() != null) {

            allowedUserSerivce.createAllowedUserInBulk(
                    savedQuiz.getQuizId(),
                    quizDto.getAllowedEmails()
            );
        }
        return modelMapper.map(savedQuiz, QuizDto.class);
    }

    @Override
    public QuizDto updateQuiz(String quizId, QuizDto quizDto,UUID userId) {

        if (quizDto == null) {
            throw new IllegalArgumentException("Quiz data is required");
        }

        UUID quizUUID = UserHelper.parseUUID(quizId);

        Quiz existingQuiz = quizRepository
                .findByQuizIdAndHostId(quizUUID, userId)
                .orElseThrow(() ->
                        new AccessDeniedException("Quiz Not Found!")
                );


        Instant start = quizDto.getStartTime() != null
                ? quizDto.getStartTime()
                : existingQuiz.getStartTime();

        Instant end = quizDto.getEndTime() != null
                ? quizDto.getEndTime()
                : existingQuiz.getEndTime();

        validateQuizTimeWindow(start, end);


        if (quizDto.getQuizName() != null)
            existingQuiz.setQuizName(quizDto.getQuizName());

        if (quizDto.getMode() != null)
            existingQuiz.setMode(quizDto.getMode());

        if (quizDto.getStartTime() != null)
            existingQuiz.setStartTime(quizDto.getStartTime());

        if (quizDto.getEndTime() != null)
            existingQuiz.setEndTime(quizDto.getEndTime());

        /* Settings */
        existingQuiz.setAllowGuest(quizDto.isAllowGuest());
        existingQuiz.setShuffleQuestions(quizDto.isShuffleQuestions());
        existingQuiz.setShowLeaderboard(quizDto.isShowLeaderboard());

        Quiz savedQuiz = quizRepository.save(existingQuiz);

        return modelMapper.map(savedQuiz, QuizDto.class);
    }

    @Override
    public QuizDto getQuizById(String quizId, UUID userId) {

        if (quizId == null) {
            throw new IllegalArgumentException("Quiz id is null");
        }

        UUID quizUUID = UserHelper.parseUUID(quizId);

        Quiz existingQuiz = quizRepository.findByQuizIdAndHostId(quizUUID,userId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        return modelMapper.map(existingQuiz, QuizDto.class);
    }



    @Override
    public QuizDtoForParticipant getQuizForParticipantById(String quizId) {
        if (quizId == null) {
            throw new IllegalArgumentException("Quiz id is null");
        }

        UUID quizUUID = UserHelper.parseUUID(quizId);

        Quiz existingQuiz = quizRepository.findById(quizUUID)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        return modelMapper.map(existingQuiz,  QuizDtoForParticipant.class);
    }

    @Override
    public List<QuizDto> getQuizzesByHost(String hostId) {

        UUID hostUUID = UserHelper.parseUUID(hostId);
        return quizRepository.findQuizByHost_Id(hostUUID)
                .stream()
                .map(quiz -> modelMapper.map(quiz, QuizDto.class))
                .toList();
    }

    @Override
    public List<QuizDto> getAllQuizzes() {

        return quizRepository.findAll()
                .stream()
                .map(quiz -> modelMapper.map(quiz, QuizDto.class))
                .toList();
    }

    @Override
    public void deleteQuiz(String quizId, UUID userId) {
        UUID quizUUID = UserHelper.parseUUID(quizId);

        Quiz existingQuiz = quizRepository.findByQuizIdAndHostId(quizUUID,userId)
                .orElseThrow(() -> new AccessDeniedException("Quiz Not Found!"));
        if(existingQuiz.getStatus() != QuizStatus.CREATED){
            throw new IllegalArgumentException("Completed quiz can not be deleted!");
        }

        quizRepository.delete(existingQuiz);
    }

    @Override
    @Transactional
    public void endQuiz(UUID quizId) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        quiz.setStatus(QuizStatus.ENDED);
        QuizSession quizSession = quizSessionRepository.findQuizSessionByQuiz_QuizId(quizId).getLast();
        if(quizSession == null){
            throw new RuntimeException("Quiz Session not found");
        }
        Map<UUID, ParticipantAntiCheatState> cheatStates =
                quizAntiCheatService.consumeSession(quizSession.getSessionId());

        if (cheatStates == null)
            cheatStates = Map.of();        
        quizRepository.save(quiz);
        Map<UUID, Participant> participantMap =
                participantRepository.findAllByQuiz_QuizId(quizId)
                        .stream()
                        .collect(Collectors.toMap(
                                Participant::getParticipantId,
                                p -> p
                        ));

        List<Object[]> stats =
                questionAnalyticsUserRepository.getParticipantStats(quizId);

        List<ParticipantPerformance> performances = new ArrayList<>();

        for (Object[] row : stats) {
            UUID participantId = (UUID) row[0];
            Integer score = ((Long) row[1]).intValue();
            Long totalTime = (Long) row[2];
            ParticipantAntiCheatState cheat = cheatStates.get(participantId);
            float tabSwitches = cheat != null ? cheat.getTabSwitches() : 0;
            System.out.println("Tab switches for " + participantId + " " + tabSwitches);
            performances.add(
                    ParticipantPerformance.builder()
                            .participant(participantMap.get(participantId))
                            .quiz(quiz)
                            .score(score)
                            .totalTimeSpent(totalTime)
                            .cheatingRiskScore(tabSwitches)
                            .build()
            );
        }

        // 🔥 BULK INSERT
        participantPerformanceRepository.saveAll(performances);

        // 🔥 ONE ranking query
        participantPerformanceRepository.assignRanksByQuizId(quizId);
    }

}

