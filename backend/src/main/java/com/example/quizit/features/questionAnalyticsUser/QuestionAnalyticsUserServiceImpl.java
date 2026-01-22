package com.example.quizit.features.questionAnalyticsUser;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.question.Question;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.question.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class QuestionAnalyticsUserServiceImpl implements QuestionAnalyticsUserService {

    private final ParticipantRepository participantRepository;
    private final QuestionRepository questionRepository;
    private final QuestionAnalyticsUserRepository questionAnalyticsUserRepository;
    private final ModelMapper modelMapper;
    @Override
    public QuestionAnalyticsUserDto createQuestionAnalyticsUser(QuestionAnalyticsUserDto dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Question analytics data cannot be null");
        }

        if (dto.getParticipantId() == null) {
            throw new IllegalArgumentException("Participant ID is required");
        }

        if (dto.getQuestionId() == null) {
            throw new IllegalArgumentException("Question ID is required");
        }

        Participant participant = participantRepository
                .findById(dto.getParticipantId())
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));

        Question question = questionRepository
                .findById(dto.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        if (questionAnalyticsUserRepository
                .existsByParticipantAndQuestion(participant, question)) {
            throw new IllegalStateException(
                    "Analytics already exists for this participant and question");
        }


        QuestionAnalyticsUser analytics = modelMapper.map(dto, QuestionAnalyticsUser.class);

        analytics.setParticipant(participant);
        analytics.setQuestion(question);
        boolean isCorrect = false;
//        if(analytics.getSelectedAnswer() != null && question.getCorrectAnswer() != null){
//            Object selectedKey = dto.getSelectedAnswer().get("key");
//            Object correctKey = question.getCorrectAnswer().get("key");
//
//            if (selectedKey != null && correctKey != null) {
//                isCorrect = selectedKey.toString().equals(correctKey.toString());
//            }
//        }
        analytics.setIsCorrect(isCorrect);
        if (analytics.getTabSwitchCount() == null) {
            analytics.setTabSwitchCount(0);
        }
        QuestionAnalyticsUser saved = questionAnalyticsUserRepository.save(analytics);

        return modelMapper.map(saved, QuestionAnalyticsUserDto.class);
    }

    @Override
    public List<QuestionAnalyticsUserDto> getQuestionAnalyticsUsersByParticipantId(String participantId) {

        if (participantId == null) {
            throw new IllegalArgumentException("Participant ID cannot be null");
        }
        UUID pid = UUID.fromString(participantId);
        Participant participant = participantRepository.findById(pid).orElseThrow(() -> new ResourceNotFoundException("Participant not found"));

        return questionAnalyticsUserRepository
                .findAllByParticipant(participant)
                .stream()
                .map(analytics -> modelMapper.map(analytics, QuestionAnalyticsUserDto.class))
                .toList();
    }

    @Override
    public QuestionAnalyticsUserDto updateQuestionAnalyticsUser(String uuid, QuestionAnalyticsUserDto dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Question analytics data cannot be null");
        }

        UUID qauId = UserHelper.parseUUID(uuid);

        QuestionAnalyticsUser existing = questionAnalyticsUserRepository.findById(qauId)
                .orElseThrow(() -> new ResourceNotFoundException("Question analytics not found"));

            existing.setSelectedAnswer(dto.getSelectedAnswer());




        if (dto.getIsCorrect() != null) {
//            System.out.println("temp");
             existing.setIsCorrect(dto.getIsCorrect());
        }
        if (dto.getTimeSpent() != null && dto.getTimeSpent() > 0) {
            existing.setTimeSpent(
                    (existing.getTimeSpent() == null ? 0 : existing.getTimeSpent())
                            + dto.getTimeSpent()
            );
        }

        if (dto.getTabSwitchCount() != null && dto.getTabSwitchCount() > 0) {
            existing.setTabSwitchCount(
                    (existing.getTabSwitchCount() == null ? 0 : existing.getTabSwitchCount())
                            + dto.getTabSwitchCount()
            );
        }

        QuestionAnalyticsUser updated =
                questionAnalyticsUserRepository.save(existing);

        return modelMapper.map(updated, QuestionAnalyticsUserDto.class);
    }

    @Override
    public QuestionAnalyticsUserDto updateQuestionAnalyticsUser(String participantId, String questionId, QuestionAnalyticsUserDto dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Question analytics data cannot be null");
        }

        UUID pId = UserHelper.parseUUID(participantId);
        UUID qId = UserHelper.parseUUID(questionId);

        QuestionAnalyticsUser existing =
                questionAnalyticsUserRepository.findByParticipant_ParticipantIdAndQuestion_QuestionId(pId, qId)
                        .orElseThrow(() -> new ResourceNotFoundException("Analytics not found for this participant and question"));


        if (dto.getSelectedAnswer() != null) {
            existing.setSelectedAnswer(dto.getSelectedAnswer());
        }

        if (dto.getIsCorrect() != null) {
            existing.setIsCorrect(dto.getIsCorrect());
        }

        if (dto.getTimeSpent() != null && dto.getTimeSpent() > 0) {
            existing.setTimeSpent(
                    (existing.getTimeSpent() == null ? 0 : existing.getTimeSpent())
                            + dto.getTimeSpent()
            );
        }

        if (dto.getTabSwitchCount() != null && dto.getTabSwitchCount() > 0) {
            existing.setTabSwitchCount(
                    (existing.getTabSwitchCount() == null ? 0 : existing.getTabSwitchCount())
                            + dto.getTabSwitchCount()
            );
        }



        QuestionAnalyticsUser updated =
                questionAnalyticsUserRepository.save(existing);

        return modelMapper.map(updated, QuestionAnalyticsUserDto.class);
    }


    @Override
    public QuestionAnalyticsUserDto getQuestionAnalyticsUserById(String questionAnalyticsUserId) {
        if (questionAnalyticsUserId == null) {
            throw new IllegalArgumentException("Question analytics user ID cannot be null");
        }
         UUID qauId = UserHelper.parseUUID(questionAnalyticsUserId);

        QuestionAnalyticsUser analytics =
                questionAnalyticsUserRepository.findById(qauId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Question analytics user not found"));

        return modelMapper.map(analytics, QuestionAnalyticsUserDto.class);
    }

    @Override
    public QuestionAnalyticsUserDto getQuestionAnalyticsUserById(String participantId, String questionID) {

        UUID pId = UserHelper.parseUUID(participantId);
        UUID qId = UserHelper.parseUUID(questionID);

        QuestionAnalyticsUser analytics = questionAnalyticsUserRepository.findByParticipant_ParticipantIdAndQuestion_QuestionId(pId, qId)
                                             .orElseThrow(() -> new ResourceNotFoundException("Question analytics not found for this participant and question"));

        return modelMapper.map(analytics, QuestionAnalyticsUserDto.class);
    }


    @Override
    public void deleteQuestionAnalyticsUser(String questionAnalyticsUserId) {

        UUID qauId = UserHelper.parseUUID(questionAnalyticsUserId);
        if (questionAnalyticsUserId == null) {
            throw new IllegalArgumentException("Question analytics user ID cannot be null");
        }

        QuestionAnalyticsUser existing =
                questionAnalyticsUserRepository.findById(qauId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Question analytics user not found"));

        questionAnalyticsUserRepository.delete(existing);
    }

}
