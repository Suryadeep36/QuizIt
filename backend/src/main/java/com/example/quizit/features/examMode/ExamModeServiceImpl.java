package com.example.quizit.features.examMode;

import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.allowedUser.AllowedUserRepository;
import com.example.quizit.features.allowedUser.InvitationStatus;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantDto;
import com.example.quizit.features.registeredUser.RegisteredUser;
import com.example.quizit.features.registeredUser.RegisteredUserDto;
import com.example.quizit.features.registeredUser.RegisteredUserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ExamModeServiceImpl implements ExamModeService{
    private final RegisteredUserRepository registeredUserRepository;
    private final AllowedUserRepository allowedUserRepository;
    private final ModelMapper modelMapper;
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
        registeredUserRepository.save(registeredUser);
        return PreRegisterResponse.builder()
                .registeredUser(modelMapper.map(registeredUser, RegisteredUserDto.class))
                .participant(modelMapper.map(registeredUser.getParticipant(), ParticipantDto.class))
                .build();
    }
}
