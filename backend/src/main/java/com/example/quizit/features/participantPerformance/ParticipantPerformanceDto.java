package com.example.quizit.features.participantPerformance;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.quiz.Quiz;
import lombok.*;

import java.util.UUID;
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ParticipantPerformanceDto {

    private UUID performanceId;
    private Participant participant;
    private Quiz quiz;
    private Integer score;
    private Integer rank;
    private Long totalTimeSpent;
    private Float cheatingRiskScore;
}
