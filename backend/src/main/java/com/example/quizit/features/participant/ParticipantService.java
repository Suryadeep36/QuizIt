package com.example.quizit.features.participant;

import com.example.quizit.dtos.ParticipantResultDTO;
import com.example.quizit.features.user.User;

import java.util.List;

public interface ParticipantService {

    public ParticipantDto createParticipant(ParticipantDto participantDto);
    public ParticipantDto getParticipantById(String uuid);
    public List<ParticipantDto> getParticipantByQuizId(String uuid);
    public List<ParticipantDto> getParticipantByUserId(String uuid);
    public void deleteParticipant(String uuid);
    public ParticipantDto updateParticipant(String uuid,ParticipantDto participantDto);
    public ParticipantDto addUser(String uuid, String user_uuid);
    public List<ParticipantResultDTO> getParticipantHistory(String userId);
}
