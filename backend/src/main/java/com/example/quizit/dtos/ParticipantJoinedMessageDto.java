package com.example.quizit.dtos;

import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
@Setter
public class ParticipantJoinedMessageDto {
    private String messageType;
    private UUID sessionId;
    private UUID participantId;
    private String name;
}
