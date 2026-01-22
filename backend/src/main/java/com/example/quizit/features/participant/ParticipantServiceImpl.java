package com.example.quizit.features.participant;

import com.example.quizit.dtos.ParticipantResultDTO;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.user.User;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
    public ParticipantDto addUser(String uuid, String user_uuid) {


        UUID participantId = UserHelper.parseUUID(uuid);
        UUID userId =  UserHelper.parseUUID(user_uuid);

            Participant existingParticipant = participantRepository.findById(participantId)
                    .orElseThrow(()-> new ResourceNotFoundException("Participant not found"));

            User user =  userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if(existingParticipant.getUser() == null)
            existingParticipant.setUser(user);
            else if(!existingParticipant.getUser().getId().equals(userId))
                throw new IllegalArgumentException("Participant already linked with "+existingParticipant.getUser().getUsername()+ " account");

            participantRepository.save(existingParticipant);
            return modelMapper.map(existingParticipant, ParticipantDto.class);


    }

    public List<ParticipantResultDTO> getParticipantHistory(String userId) {
        // 1. Get all participation records for the user
        UUID userid = UUID.fromString(userId);
        List<Participant> participants = participantRepository.findAllByUser_Id(userid);

        // 2. Map to DTO and fetch Quiz Names efficiently
        return participants.stream().map(p -> {
            ParticipantResultDTO dto = new ParticipantResultDTO();
            dto.setId(String.valueOf(p.getParticipantId()));
            dto.setQuizId(String.valueOf(p.getQuiz().getQuizId()));
            dto.setParticipantName(p.getParticipantName());
//            dto.setScore(p.getScore());
            if (p.getQuiz().getStartTime() != null) {
                dto.setDate(LocalDateTime.ofInstant(
                        p.getQuiz().getStartTime(),
                        ZoneId.of("UTC")
                ));
            }

            // 3. Fetch Quiz Details (Handle case where quiz is deleted)
            Optional<Quiz> quizOpt = quizRepository.findById(p.getQuiz().getQuizId());
            if (quizOpt.isPresent()) {
                Quiz quiz = quizOpt.get();
                dto.setQuizName(quiz.getQuizName());
            } else {
                dto.setQuizName("Unknown Quiz (Deleted)");
                dto.setTotalQuestions(0);
            }

            return dto;
        }).collect(Collectors.toList());
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
