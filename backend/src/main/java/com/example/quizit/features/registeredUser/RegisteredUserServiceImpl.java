package com.example.quizit.features.registeredUser;

import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.allowedUser.AllowedUserRepository;
import com.example.quizit.features.allowedUser.AllowedUserSerivce;
import com.example.quizit.features.allowedUser.InvitationStatus;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
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
    private final QuizRepository quizRepository;
    @Override
    @Transactional
    public RegisteredUserDto registerUser(RegisteredUserDto registeredUserDto, User user, String userAgent, String ipAddress) {

        if (user == null)
            throw new AccessDeniedException("Only Authenticated user can be registered");

        System.out.println(registeredUserDto.toString());

        // find quiz
        Quiz quiz = quizRepository.findById(registeredUserDto.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        AllowedUser allowedUser;

        // CASE 1 : Quiz does NOT allow all authenticated users
        if (!quiz.isAllowAllAuthenticated()) {

            allowedUser = allowedUserRepository
                    .findByEmailAndQuiz_QuizId(user.getEmail(), registeredUserDto.getQuizId())
                    .orElseThrow(() -> new AccessDeniedException("User not allowed for this quiz"));

            if (allowedUser.isRegistered()) {
                throw new IllegalStateException("User already registered for this quiz");
            }

            if (!allowedUser.getToken().equals(registeredUserDto.getRegistrationToken())) {
                throw new AccessDeniedException("Access denied");
            }

        }
        // CASE 2 : Quiz allows all authenticated users
        else {

            allowedUser = allowedUserRepository
                    .findByEmailAndQuiz_QuizId(user.getEmail(), registeredUserDto.getQuizId())
                    .orElse(null);

            if (allowedUser == null) {

                allowedUser = AllowedUser.builder()
                        .email(user.getEmail())
                        .quiz(quiz)
                        .registered(true)
                        .invitationStatus(InvitationStatus.REGISTERED)
                        .build();

                allowedUser = allowedUserRepository.save(allowedUser);

            } else if (allowedUser.isRegistered()) {

                throw new IllegalStateException("User already registered for this quiz");
            }
        }

        // create participant
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
        registeredUser.setUserAgent(userAgent);
        registeredUser.setIpAddress(ipAddress);

        allowedUser.setRegistered(true);
        allowedUser.setInvitationStatus(InvitationStatus.REGISTERED);

        allowedUserRepository.save(allowedUser);

        registeredUser = registeredUserRepository.save(registeredUser);

        return modelMapper.map(registeredUser, RegisteredUserDto.class);
    }

//    @Override
//    @Transactional
//    public RegisteredUserDto registerUser(RegisteredUserDto registeredUserDto, User user, String userAgent, String ipAddress) {
//
//        if(user == null)
//            throw new AccessDeniedException("Only Authenticated user can be registered");
//
//        System.out.println(registeredUserDto.toString());
//
//
//        AllowedUser allowedUser = allowedUserRepository.findByEmailAndQuiz_QuizId(user.getEmail(), registeredUserDto.getQuizId())
//                .orElseThrow(() -> new AccessDeniedException("User not found")
//                );
//        if (!allowedUser.getToken().equals(registeredUserDto.getRegistrationToken())) {
//            throw new AccessDeniedException("Access denied");
//        }
//
//        Participant participant = Participant.builder()
//                .participantName(registeredUserDto.getName())
//                .quiz(allowedUser.getQuiz())
//                .user(user)
//                .build();
//        participant = participantRepository.save(participant);
//
//        RegisteredUser registeredUser = modelMapper.map(registeredUserDto, RegisteredUser.class);
//        registeredUser.setEmail(user.getEmail());
//        registeredUser.setAllowedUser(allowedUser);
//        registeredUser.setRegisteredAt(Instant.now());
//        registeredUser.setParticipant(participant);
//        registeredUser.setBirthdate(registeredUser.getBirthdate());
//        registeredUser.setUserAgent(userAgent);
//        registeredUser.setIpAddress(ipAddress);
//        allowedUser.setRegistered(true);
//        allowedUser.setInvitationStatus(InvitationStatus.REGISTERED);
//        allowedUserRepository.save(allowedUser);
//        registeredUser = registeredUserRepository.save(registeredUser);
//        return modelMapper.map(registeredUser, RegisteredUserDto.class);
//    }

    @Override
    public CheckStatusDto checkStatus(String token, User user) {

       AllowedUser allowedUser =  allowedUserRepository.findByEmailAndToken(user.getEmail(), token).orElseThrow(() -> new AccessDeniedException("User not found"));
       CheckStatusDto checkStatusDto = CheckStatusDto.builder()
               .registered(allowedUser.isRegistered())
               .registrationToken(token)
               .build();
        return checkStatusDto ;
    }
}
