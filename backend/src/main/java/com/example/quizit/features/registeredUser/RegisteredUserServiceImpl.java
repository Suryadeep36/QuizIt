package com.example.quizit.features.registeredUser;

import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.allowedUser.AllowedUserRepository;
import com.example.quizit.features.allowedUser.AllowedUserSerivce;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.user.User;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@AllArgsConstructor
public class RegisteredUserServiceImpl implements RegisteredUserService {

    private final AllowedUserRepository allowedUserRepository;
    private final ModelMapper modelMapper;
    private final ParticipantRepository participantRepository;
    private final RegisteredUserRepository registeredUserRepository;

    @Override
    @Transactional
    public RegisteredUserDto registerUser(RegisteredUserDto registeredUserDto, User user) {
        System.out.println(registeredUserDto.toString());
        AllowedUser allowedUser = allowedUserRepository.findByEmailAndQuiz_QuizId(user.getEmail(), registeredUserDto.getQuizId())
                .orElseThrow(() -> new AccessDeniedException("User not found")
                );
        if (!allowedUser.getToken().equals(registeredUserDto.getRegistrationToken())) {
            throw new AccessDeniedException("Access denied");
        }

        Participant participant = Participant.builder()
                .participantName(registeredUserDto.getName())
                .quiz(allowedUser.getQuiz())
                .user(user)
                .build();
        participant = participantRepository.save(participant);

        RegisteredUser registeredUser = modelMapper.map(registeredUserDto, RegisteredUser.class);
        registeredUser.setEmail(user.getEmail());
        registeredUser.setAllowedUser(allowedUser);
        registeredUser.setRegisteredAt(Instant.now());
        registeredUser.setParticipant(participant);
        registeredUser.setBirthdate(registeredUser.getBirthdate());
        allowedUser.setRegistered(true);
        allowedUserRepository.save(allowedUser);
        registeredUser = registeredUserRepository.save(registeredUser);
        return modelMapper.map(registeredUser, RegisteredUserDto.class);
    }
}
