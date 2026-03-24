package com.example.quizit.features.examMode;

import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.allowedUser.AllowedUserRepository;
import com.example.quizit.features.allowedUser.InvitationStatus;
import com.example.quizit.features.participant.ParticipantDto;
import com.example.quizit.features.participant.ParticipantStatus;
import com.example.quizit.features.question.*;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.registeredUser.RegisteredUser;
import com.example.quizit.features.registeredUser.RegisteredUserDto;
import com.example.quizit.features.registeredUser.RegisteredUserRepository;
import com.example.quizit.mapper.QuestionToQuestionUserMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ExamModeServiceImpl implements ExamModeService {
    private final RegisteredUserRepository registeredUserRepository;
    private final AllowedUserRepository allowedUserRepository;
    private final ModelMapper modelMapper;
    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final ExamRedisService examRedisService;
    private final QuestionToQuestionUserMapper mapper;

    @Override
    public PreRegisterResponse preRegisterParticipant(PreRegisterUserDto preRegisterUserDto, UUID userId, String userAgent, String ipAddress) {
        AllowedUser allowedUser = allowedUserRepository.findByEmailAndQuiz_QuizId(
                preRegisterUserDto.getEmail(),
                preRegisterUserDto.getQuizId()
        ).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found in invite list"));
        RegisteredUser registeredUser = registeredUserRepository.findByAllowedUser_Id(allowedUser.getId());
        if (registeredUser == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration records not found");
        }

        LocalDate inputDate = preRegisterUserDto.getBirthDate();
        if (!registeredUser.getBirthdate().equals(inputDate)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Security Key (Birthdate mismatch)");
        }

        UUID registrationOwnerId = registeredUser.getParticipant().getUser().getId();
        if (!registrationOwnerId.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This registration does not belong to you");
        }

        if (!allowedUser.isRegistered()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not registered");
        }
        Quiz quiz = quizRepository.getReferenceById(preRegisterUserDto.getQuizId());
        Instant now = Instant.now();
        Duration untilStart = Duration.between(now, quiz.getStartTime());
        if (untilStart.toSeconds() > 300) {
            throw new ResponseStatusException(HttpStatus.TOO_EARLY, "You can only pre-register 5 minutes before the quiz starts");
        }
        registeredUser.setUserAgent(userAgent);
        registeredUser.setIpAddress(ipAddress);
        registeredUser.getParticipant().setStatus(ParticipantStatus.READY);
        registeredUserRepository.save(registeredUser);

        List<Question> questionList = questionRepository.findByQuiz_QuizIdOrderByDisplayOrder(preRegisterUserDto.getQuizId());
        List<QuestionForUserDto> questionDtos = questionList.stream()
                .map((q) -> modelMapper.map(q, QuestionDto.class))
                .map(mapper::toUserDto)
                .collect(Collectors.toList());
        Duration duration = Duration.between(quiz.getStartTime(), quiz.getEndTime());

        examRedisService.cacheQuestions(preRegisterUserDto.getQuizId(), questionDtos, duration);
        List<UUID> questionIds = questionList.stream()
                .map(Question::getQuestionId)
                .collect(Collectors.toList());

        if (questionIds.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quiz has no questions configured"
            );
        }

        examRedisService.storeShuffledOrderIfAbsent(preRegisterUserDto.getQuizId()
                ,registeredUser.getParticipant().getParticipantId()
                ,questionIds
                ,duration
        );
        examRedisService.initializeAttempt(preRegisterUserDto.getQuizId(), registeredUser.getParticipant().getParticipantId(), duration);
        examRedisService.getOrInitializeParticipantCount(preRegisterUserDto.getQuizId(), () ->  allowedUserRepository.countAllowedUserByQuiz_QuizIdAndInvitationStatus(preRegisterUserDto.getQuizId(), InvitationStatus.REGISTERED), duration);
        return PreRegisterResponse.builder()
                .registeredUser(modelMapper.map(registeredUser, RegisteredUserDto.class))
                .participant(modelMapper.map(registeredUser.getParticipant(), ParticipantDto.class))
                .questionList(examRedisService.getShuffledOrderQuestionList(preRegisterUserDto.getQuizId(), registeredUser.getParticipant().getParticipantId()))
                .build();
    }

    @Override
    public ExamNavigationResponse startExam(UUID quizId, UUID participantId) {
        Quiz quiz = quizRepository.getReferenceById(quizId);
        Instant now = Instant.now();
        Instant startTime = quiz.getStartTime();
        Instant endTime = quiz.getEndTime();
        if (now.isBefore(startTime)) {
            throw new ResponseStatusException(HttpStatus.TOO_EARLY, "Exam has not started yet");
        }
        if (!now.isBefore(endTime)) {
            throw new ResponseStatusException(HttpStatus.GONE, "Exam has already ended");
        }
        Duration duration = Duration.between(startTime, endTime);
        QuestionForUserDto currentQuestion =
                examRedisService.startAttempt(quizId, participantId, duration);
        List<OptionDto> shuffledOptionList = getShuffledOptions(currentQuestion, participantId, quiz.isShuffleQuestions());
        currentQuestion.setShuffledOptionList(shuffledOptionList);
        return examRedisService.buildNavigationResponse(quizId, participantId, currentQuestion);
    }

    @Override
    public ExamNavigationResponse switchQuestion(UUID quizId, UUID participantId, int targetIndex, int tabSwitches) {
        Quiz quiz = quizRepository.getReferenceById(quizId);
        int totalQuestions = examRedisService.getTotalQuestions(quizId, participantId);
        if (targetIndex < 0 || targetIndex >= totalQuestions) {
            return null;
        }

        QuestionForUserDto nextQuestion = examRedisService.switchQuestion(quizId, participantId, targetIndex, tabSwitches);
        List<OptionDto> shuffledOptionList = getShuffledOptions(nextQuestion, participantId, quiz.isShuffleQuestions());
        nextQuestion.setShuffledOptionList(shuffledOptionList);
        return examRedisService.buildNavigationResponse(quizId, participantId, nextQuestion);
    }

    public List<OptionDto> getShuffledOptions(QuestionForUserDto question, UUID participantId, boolean isShuffledOptions) {

        Map<String, Object> options = question.getOptions();

        List<OptionDto> optionList = new ArrayList<>(options.entrySet()
                .stream()
                .map(e -> new OptionDto(e.getKey(), e.getValue().toString()))
                .toList());
        if(isShuffledOptions){
            Collections.shuffle(optionList, new Random(participantId.hashCode()));
        }
        return optionList;
    }

    @Override
    public void submitAnswer(UUID quizId, UUID participantId, Map<String, Object> selectedAnswer) {
        examRedisService.submitAnswer(quizId, participantId, selectedAnswer);
    }

    @Override
    @Transactional
    public void submitExam(UUID quizId, UUID participantId) {
        RegisteredUser registeredUser = registeredUserRepository.findRegisteredUserByParticipant_ParticipantId(participantId);
        if (registeredUser == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Registered user not found");
        }
        AllowedUser allowedUser = registeredUser.getAllowedUser();
        examRedisService.doFinalSubmit(quizId, participantId);
        System.out.println("Participant " + participantId + " submitted their quiz " + quizId);
        allowedUser.setInvitationStatus(InvitationStatus.QUIZ_SUBMITTED);
    }

}
