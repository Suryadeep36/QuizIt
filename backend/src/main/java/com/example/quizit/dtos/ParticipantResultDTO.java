package com.example.quizit.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ParticipantResultDTO {
    private String id;              // Participant ID
    private String quizId;
    private String quizName;
    private String participantName;// <--- The new field we need
    private Integer score;
    private Integer totalQuestions; // <--- The new field we need
    private LocalDateTime date;
}
