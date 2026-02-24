package com.example.quizit.features.allowedUser;

import com.example.quizit.features.quiz.Quiz;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Setter
@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllowedUserStatusDto {
    private UUID id;
    private String email;
    private boolean registered;
    private UUID quiz;
    private InvitationStatus invitationStatus;
    private Instant invitationSentAt;
    private String deliveryErrorMessage;
}
