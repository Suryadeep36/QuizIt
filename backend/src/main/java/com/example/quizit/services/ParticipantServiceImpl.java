package com.example.quizit.services;

import com.example.quizit.dtos.ParticipantDto;
import com.example.quizit.entities.Participant;
import com.example.quizit.entities.Quiz;
import com.example.quizit.entities.User;
import com.example.quizit.enums.ParticipantStatus;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.repositories.ParticipantRepository;
import com.example.quizit.repositories.QuizRepository;
import com.example.quizit.repositories.UserRepository;
import com.example.quizit.services.interfaces.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipantServiceImpl implements ParticipantService {

    private final ParticipantRepository participantRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Override
    public ParticipantDto getParticipantById(String id) {
        UUID  uuid = UUID.fromString(id);
        Participant participant = participantRepository.findById(uuid).orElseThrow(()-> new ResourceNotFoundException("Participant not found"));

        return modelMapper.map(participant, ParticipantDto.class);
    }

    @Override
    public List<ParticipantDto> getParticipantByQuizId(String id) {
        UUID  uuid = UUID.fromString(id);
        return   participantRepository.findAllByQuiz_QuizId(uuid).stream()
                .map(participant -> modelMapper.map(participant,ParticipantDto.class))
                .toList();
    }

    @Override
    public List<ParticipantDto> getParticipantByUserId(String id) {
        UUID  uuid = UUID.fromString(id);
        return participantRepository.findAllByUser_Id(uuid).stream()
                .map(participant -> modelMapper.map(participant,ParticipantDto.class))
                .toList();
    }

    @Override
    public ParticipantDto createParticipant(ParticipantDto participantDto) {

        if (participantDto == null) {
            throw new IllegalArgumentException("Participant cannot be null");
        }

        if (participantDto.getQuizId() == null) {
            throw new IllegalArgumentException("Quiz Id cannot be null");
        }



        Quiz quiz = quizRepository.findById(participantDto.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));



        Participant participant = modelMapper.map(participantDto, Participant.class);

        if(participantDto.getUserId() != null)
        {
            User user = userRepository.findById(participantDto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
          participant.setUser(user);
        }
        participant.setQuiz(quiz);

        Participant saved = participantRepository.save(participant);
        return modelMapper.map(saved, ParticipantDto.class);
    }

    @Override
    public ParticipantDto updateParticipant(String id,ParticipantDto participantDto) {
        if (participantDto == null) {
            throw new IllegalArgumentException("Participant cannot be null");
        }
        UUID uuid = UserHelper.parseUUID(id);

        Participant existingParticipant = participantRepository.findById(uuid).orElseThrow(()-> new ResourceNotFoundException("Participant not found"));

        if (participantDto.getStatus() != null) {
            existingParticipant.setStatus(participantDto.getStatus());
        }

        if (existingParticipant.getStatus() == ParticipantStatus.SUBMITTED) {
            throw new IllegalStateException("Cannot update submitted participant");
        }

        Participant updatedParticipant = participantRepository.save(existingParticipant);
        return modelMapper.map(updatedParticipant, ParticipantDto.class);
    }

    @Override
    public void deleteParticipant(String id) {
        UUID uuid = UserHelper.parseUUID(id);
          participantRepository.deleteById(uuid);
    }
}
