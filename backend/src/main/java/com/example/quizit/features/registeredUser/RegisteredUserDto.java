package com.example.quizit.features.registeredUser;


import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@Builder
@NoArgsConstructor
@ToString
public class RegisteredUserDto {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "Birthdate is required")
    private LocalDate birthDate;

    @NotBlank(message = "Enrollment ID is required")
    private String enrollmentId;

    @NotBlank(message = "registration Token is required")
    private String registrationToken;

    private String userAgent;

    private String ipAddress;


    private UUID quizId;
}