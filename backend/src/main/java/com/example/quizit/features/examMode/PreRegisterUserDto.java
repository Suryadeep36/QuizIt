package com.example.quizit.features.examMode;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PreRegisterUserDto {
    private UUID quizId;
    private LocalDate birthDate;
    private String email;
}
