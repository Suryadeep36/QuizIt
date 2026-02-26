package com.example.quizit.features.registeredUser;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@Builder
public class CheckStatusDto {

    @NotBlank(message = "registration Token is required")
    private String registrationToken;

    private boolean registered ;
}
