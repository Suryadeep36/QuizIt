package com.example.quizit.features.quiz;


import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.allowedUser.AllowedUserRepository;
import com.example.quizit.features.allowedUser.AllowedUserSerivce;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.participantPerformance.ParticipantPerformance;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.participantPerformance.ParticipantPerformanceRepository;
import com.example.quizit.features.question.Question;
import com.example.quizit.features.questionAnalyticsQuiz.QuestionAnalyticsQuiz;
import com.example.quizit.features.questionAnalyticsQuiz.QuestionAnalyticsQuizService;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUserRepository;
import com.example.quizit.features.quizSession.QuizSession;
import com.example.quizit.features.quizSession.QuizSessionRepository;
import com.example.quizit.features.user.UserRepository;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.records.ParticipantAntiCheatState;
import com.example.quizit.services.QuizAntiCheatService;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
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
    private final AllowedUserRepository allowedUserRepository;
    private final QuestionAnalyticsQuizService questionAnalyticsQuizService;
    private final TaskScheduler taskScheduler;



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

//        if (quizDto.getQuizName() != null &&
//                quizRepository.existsByQuizNameAndHostId(
//                        quizDto.getQuizName(), userId)) {
//                throw new IllegalArgumentException("Quiz already exists");
//        }

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

        existingQuiz.setAllowAllAuthenticated(quizDto.isAllowAllAuthenticated());
        existingQuiz.setAllowGuest(quizDto.isAllowGuest());
        existingQuiz.setShuffleQuestions(quizDto.isShuffleQuestions());
        existingQuiz.setShowLeaderboard(quizDto.isShowLeaderboard());

        Set<String> updatedEmailList = quizDto.getAllowedEmails()
                .stream()
                .map(e -> e.trim().toLowerCase())
                .collect(Collectors.toSet());

        List<AllowedUser> existingUsers =
                allowedUserRepository.findAllByQuiz_QuizId(quizUUID);

        Set<String> currentEmailList = existingUsers.stream()
                .map(AllowedUser::getEmail)
                .collect(Collectors.toSet());

        Set<String> usersToAdd = new HashSet<>(updatedEmailList);
        usersToAdd.removeAll(currentEmailList);

        Set<String> usersToRemove = new HashSet<>(currentEmailList);
        usersToRemove.removeAll(updatedEmailList);


        allowedUserSerivce.createAllowedUserInBulk(
                quizUUID,
                usersToAdd.stream().toList()
        );

        allowedUserSerivce.deleleAllowedUserInBulk(
                quizUUID,
                usersToRemove.stream().toList()
        );
        Quiz savedQuiz = quizRepository.save(existingQuiz);

        //CHECKING PURPOSE
//        scheduleQuizEnd(savedQuiz);

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

        List<String> emails = allowedUserRepository
                .findAllByQuiz_QuizId(quizUUID)
                .stream()
                .map(AllowedUser::getEmail)
                .toList();

        QuizDto response = modelMapper.map(existingQuiz, QuizDto.class);
        response.setAllowedEmails(emails);
        return response;
    }



    @Override
    public QuizDtoForParticipant getQuizForParticipantById(String quizId) {
        if (quizId == null) {
            throw new IllegalArgumentException("Quiz id is null");
        }

        UUID quizUUID = UserHelper.parseUUID(quizId);

        Quiz existingQuiz = quizRepository.findById(quizUUID)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        System.out.println("Duration"  + quizRepository.getTotalDurationByQuizId(quizUUID));
        return QuizDtoForParticipant.builder()
                .quizId(quizUUID)
                .quizName(existingQuiz.getQuizName())
                .mode(existingQuiz.getMode())
                .startTime(existingQuiz.getStartTime())
                .endTime(existingQuiz.getEndTime())
                .host(existingQuiz.getHost().getId())
                .duration(quizRepository.getTotalDurationByQuizId(quizUUID))
                .build();
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

    private Instant parseToInstant(String dateTime) {
        LocalDateTime ldt = LocalDateTime.parse(dateTime);
        return ldt
                .atZone(ZoneId.of("Asia/Kolkata"))
                .toInstant();
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


    public void scheduleQuizEnd(Quiz quiz) {
        if(quiz.getStatus().equals(QuizStatus.CREATED)){
            Instant executionTime = quiz.getEndTime().plusSeconds(quizRepository.getTotalDurationByQuizId(quiz.getQuizId()));
            quiz.setStatus(QuizStatus.STARTED);
            //CHECKING PURPOSE
            //        Instant executionTime = quiz.getEndTime();
            System.out.println("Exection time " + executionTime.toString());


            taskScheduler.schedule(() -> {
                System.out.println("Start execting task");
                quiz.setStatus(QuizStatus.ENDED);
                quizRepository.save(quiz);

                UUID quizId = quiz.getQuizId();
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
                    performances.add(
                            ParticipantPerformance.builder()
                                    .participant(participantMap.get(participantId))
                                    .quiz(quiz)
                                    .score(score)
                                    .totalTimeSpent(totalTime)
                                    .build()
                    );

                    // 🔥 BULK INSERT
                    participantPerformanceRepository.saveAll(performances);

                    // 🔥 ONE ranking query
                    participantPerformanceRepository.assignRanksByQuizId(quizId);

                }

                try{
                    questionAnalyticsQuizService.createAllByQuizId(quizId.toString(),quiz.getHost().getId());
                    questionAnalyticsQuizService.calculateAfterQuiz(quizId,quiz.getHost().getId());

                }catch(Exception e){
                    e.printStackTrace();
                    System.out.println("QAQ");
                }
            }, executionTime);
            quizRepository.save(quiz);
        }
    }

}

