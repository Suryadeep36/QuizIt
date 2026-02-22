package com.example.quizit.features.allowedUser;


import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AllowedUserServiceImpl implements AllowedUserSerivce{
    private final QuizRepository quizRepository;
    private final AllowedUserRepository allowedUserRepository;

    private static final long TOKEN_EXPIRY_SECONDS = 172800;


    @Override
    @Transactional
    public AllowedUserResponse createAllowedUser(AllowedUserRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null");
        }

        if(allowedUserRepository.existsAllowedUserByEmailAndQuiz_QuizId(request.getEmail(), request.getQuizId())){
            throw new IllegalStateException("User already allowed for this quiz");
        }

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        AllowedUser allowedUser = AllowedUser.builder()
                .email(request.getEmail())
                .token(UUID.randomUUID().toString())
                .registered(false)
                .tokenExpiry(Instant.now().plusSeconds(TOKEN_EXPIRY_SECONDS))
                .quiz(quiz)
                .build();

        allowedUserRepository.save(allowedUser);

        return AllowedUserResponse.builder()
                .id(allowedUser.getId())
                .email(allowedUser.getEmail())
                .registered(false)
                .build();
    }

    @Override
    @Transactional
    public void createAllowedUserInBulk(UUID quizId, List<String> emails) {

        if (quizId == null) {
            throw new IllegalArgumentException("quiz id is null");
        }

        if (emails == null || emails.isEmpty()) {
            return;
        }

        Quiz quiz = quizRepository.getReferenceById(quizId);

        List<AllowedUser> allowedUsers = emails.stream()
                .map(email -> AllowedUser.builder()
                        .email(email.trim().toLowerCase())
                        .token(UUID.randomUUID().toString())
                        .registered(false)
                        .tokenExpiry(Instant.now().plusSeconds(172800))
                        .quiz(quiz)
                        .build())
                .toList();

        allowedUserRepository.saveAll(allowedUsers);
    }
}
