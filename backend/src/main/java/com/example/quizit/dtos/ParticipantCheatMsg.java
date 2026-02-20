package com.example.quizit.dtos;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Data
@Getter
@Setter
@Builder
public class ParticipantCheatMsg {
    private UUID participantId;
    private String participantName;
    private UUID sessionId;
    private int tabSwitches;
}
