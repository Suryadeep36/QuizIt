package com.example.quizit.features.participant;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ParticipantDto {

    private UUID participantId;
    private String participantName;
    private UUID quizId;
    private UUID userId;
    private ParticipantStatus status;
    private LocalDateTime joinedAt;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private String rollNumber;

}