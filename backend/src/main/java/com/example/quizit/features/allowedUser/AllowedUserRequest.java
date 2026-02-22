package com.example.quizit.features.allowedUser;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class AllowedUserRequest {
    private UUID quizId;
    private String email;
}
