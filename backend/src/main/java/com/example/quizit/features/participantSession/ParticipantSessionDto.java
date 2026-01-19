package com.example.quizit.features.participantSession;

import lombok.*;

import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ParticipantSessionDto {
    private UUID participantSessionId;
    private UUID participantId;
    private String participantName;
    private ParticipantSessionStatus status;
    private Integer score;
}
