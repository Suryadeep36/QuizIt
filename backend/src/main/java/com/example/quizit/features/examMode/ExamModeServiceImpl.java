package com.example.quizit.features.examMode;

import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.allowedUser.AllowedUserRepository;
import com.example.quizit.features.allowedUser.InvitationStatus;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantDto;
import com.example.quizit.features.participant.ParticipantStatus;
import com.example.quizit.features.question.Question;
import com.example.quizit.features.question.QuestionDto;
import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.question.QuestionRepository;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.registeredUser.RegisteredUser;
import com.example.quizit.features.registeredUser.RegisteredUserDto;
import com.example.quizit.features.registeredUser.RegisteredUserRepository;
import com.example.quizit.mapper.QuestionToQuestionUserMapper;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ExamModeServiceImpl implements ExamModeService{
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
        registeredUser.setUserAgent(userAgent);
        registeredUser.setIpAddress(ipAddress);
        registeredUser.getParticipant().setStatus(ParticipantStatus.READY);
        registeredUserRepository.save(registeredUser);
        Quiz quiz = quizRepository.getReferenceById(preRegisterUserDto.getQuizId());
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

        examRedisService.storeShuffledOrderIfAbsent(preRegisterUserDto.getQuizId(), registeredUser.getParticipant().getParticipantId() ,questionIds, duration);
        examRedisService.initializeAttempt(preRegisterUserDto.getQuizId(), registeredUser.getParticipant().getParticipantId(), duration);

        return PreRegisterResponse.builder()
                .registeredUser(modelMapper.map(registeredUser, RegisteredUserDto.class))
                .participant(modelMapper.map(registeredUser.getParticipant(), ParticipantDto.class))
                .questionList(examRedisService.getShuffledOrderQuestionList(preRegisterUserDto.getQuizId(), registeredUser.getParticipant().getParticipantId()))
                .build();
    }
}
