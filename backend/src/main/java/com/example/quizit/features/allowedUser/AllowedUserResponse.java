package com.example.quizit.features.allowedUser;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class AllowedUserResponse {
    private UUID id;
    private String email;
    private boolean registered;
}
