package com.example.quizit.features.participant;

import java.util.List;

public interface ParticipantService {

    public ParticipantDto createParticipant(ParticipantDto participantDto);
    public ParticipantDto getParticipantById(String uuid);
    public List<ParticipantDto> getParticipantByQuizId(String uuid);
    public List<ParticipantDto> getParticipantByUserId(String uuid);
    public void deleteParticipant(String uuid);

    public ParticipantDto updateParticipant(String uuid,ParticipantDto participantDto);
}
