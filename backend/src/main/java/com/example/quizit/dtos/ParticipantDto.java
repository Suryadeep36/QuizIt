package com.example.quizit.dtos;

import com.example.quizit.entities.Quiz;
import com.example.quizit.entities.User;
import com.example.quizit.enums.ParticipantStatus;
import jakarta.persistence.*;
import lombok.*;

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

}