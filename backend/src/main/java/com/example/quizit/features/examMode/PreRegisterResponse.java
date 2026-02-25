package com.example.quizit.features.examMode;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantDto;
import com.example.quizit.features.registeredUser.RegisteredUser;
import com.example.quizit.features.registeredUser.RegisteredUserDto;
import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PreRegisterResponse {
    RegisteredUserDto registeredUser;
    ParticipantDto participant;
}
