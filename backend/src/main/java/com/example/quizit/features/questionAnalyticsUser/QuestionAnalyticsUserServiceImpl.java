package com.example.quizit.features.questionAnalyticsUser;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.question.AnswerKey;
import com.example.quizit.features.question.Question;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.quiz.QuizStatus;
import com.example.quizit.helpers.UserHelper;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.question.QuestionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionAnalyticsUserServiceImpl implements QuestionAnalyticsUserService {

    private final ParticipantRepository participantRepository;
    private final QuestionRepository questionRepository;
    private final QuestionAnalyticsUserRepository questionAnalyticsUserRepository;
    private final ModelMapper modelMapper;
    private final QuizRepository quizRepository;
    private List<QuestionAnalyticsUserDto> dtos;

    @Override
    public QuestionAnalyticsUserDto createQuestionAnalyticsUser(QuestionAnalyticsUserDto dto) {

        if (dto == null) {
            throw new IllegalArgumentException("Question analytics data cannot be null");
        }

        if (dto.getQuizId() == null) {
            throw new IllegalArgumentException("Quiz ID is required");
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
        analytics.setQuiz(quizRepository.getReferenceById(dto.getQuizId()));
        analytics.setParticipant(participant);
        analytics.setQuestion(question);
        boolean isCorrect = validateAnswer(question ,analytics.getSelectedAnswer(), question.getCorrectAnswer());
        System.out.println("Validate for " + question.getContent());
        System.out.println(isCorrect);
        analytics.setIsCorrect(isCorrect);
        if (analytics.getTabSwitchCount() == null) {
            analytics.setTabSwitchCount(0);
        }
        QuestionAnalyticsUser saved = questionAnalyticsUserRepository.save(analytics);

        return modelMapper.map(saved, QuestionAnalyticsUserDto.class);
    }

    @Override
    @Transactional
    public List<QuestionAnalyticsUserDto> createAnalyticsInBulk(List<QuestionAnalyticsUserDto> dtos, UUID quizId, UUID participantId) {
        if(dtos == null || dtos.isEmpty()){
            throw new ResourceNotFoundException("list is empty");
        }
        Participant participant = participantRepository
                .findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));

        Quiz quiz = quizRepository.getReferenceById(quizId);
        List<Question> questionList = questionRepository.findByQuiz_QuizId(quizId);
        Map<UUID, Question> questionMap = questionList.stream()
                .collect(Collectors.toMap(Question::getQuestionId, question -> question));
        List<QuestionAnalyticsUser> list = new ArrayList<>();
        for(QuestionAnalyticsUserDto dto : dtos){
            QuestionAnalyticsUser analytics = modelMapper.map(dto, QuestionAnalyticsUser.class);
            analytics.setQuiz(quiz);
            analytics.setParticipant(participant);
            Question question = questionMap.get(dto.getQuestionId());
            analytics.setQuestion(question);
            boolean isCorrect = validateAnswer(question ,analytics.getSelectedAnswer(), question.getCorrectAnswer());
            System.out.println("Validate for " + question.getContent());
            System.out.println(isCorrect);
            analytics.setIsCorrect(isCorrect);
            if (analytics.getTabSwitchCount() == null) {
                analytics.setTabSwitchCount(0);
            }
            list.add(analytics);
        }
        questionAnalyticsUserRepository.saveAll(list);
        return list.stream()
                .map(user -> modelMapper.map(user, QuestionAnalyticsUserDto.class))
                .toList();
    }

    private boolean validateAnswer(Question question, Map<String, Object> selectedAnswer, List<AnswerKey> correctAnswer){
        if (selectedAnswer == null || selectedAnswer.isEmpty()) {
            return false;
        }
        ObjectMapper mapper = new ObjectMapper();
        switch (question.getQuestionType()){
            case MCQ:
                Object givenRawKeys = selectedAnswer.get("keys");
                if (givenRawKeys == null) return false;
                List<String> givenKeys = mapper.convertValue(givenRawKeys, new TypeReference<List<String>>() {});
                List<String> correctKeys = correctAnswer.stream()
                        .map(AnswerKey::getKey)
                        .sorted()
                        .toList();
                Collections.sort(givenKeys);
                return correctKeys.equals(givenKeys);
            case SHORT_ANSWER: {
                if (correctAnswer.isEmpty()) return false;
                Object valObj = selectedAnswer.get("value");
                if (valObj == null) return false;

                String givenVal = valObj.toString().trim();
                String correctVal = correctAnswer.getFirst().getKey().trim();

                if (question.getCaseSensitive() != null && !question.getCaseSensitive()) {
                    if (correctVal.equalsIgnoreCase(givenVal)) return true;
                } else {
                    if (correctVal.equals(givenVal)) return true;
                }

                if (question.getAcceptableAnswers() != null) {
                    for (String acc : question.getAcceptableAnswers()) {
                        if (question.getCaseSensitive() != null && !question.getCaseSensitive()) {
                            if (acc.trim().equalsIgnoreCase(givenVal)) return true;
                        } else {
                            if (acc.trim().equals(givenVal)) return true;
                        }
                    }
                }
                return false;
            }
            case NUMERICAL: {
                if (correctAnswer.isEmpty()) return false;
                Object valObj = selectedAnswer.get("value");
                if (valObj == null) return false;

                try {
                    double correctNum = Double.parseDouble(correctAnswer.getFirst().getKey());
                    double givenNum = Double.parseDouble(valObj.toString());
                    return Math.abs(correctNum - givenNum) < 0.0001;
                } catch (NumberFormatException e) {
                    return false;
                }
            }
            case TRUE_FALSE: {
                if (correctAnswer.isEmpty()) return false;
                Object valObj = selectedAnswer.get("value");
                if (valObj == null) return false;

                String correctVal = correctAnswer.getFirst().getKey();
                String givenVal = valObj.toString();
                return correctVal.equalsIgnoreCase(givenVal);
            }
            case MATCH_FOLLOWING:
                if (correctAnswer.isEmpty()) return false;
                Map<String, String> correctMap = correctAnswer.getFirst().getMatchPairs();
                Object rawUserPairs = selectedAnswer.get("matchPairs");
                System.out.println(rawUserPairs);
                List<Map<String, String>> userPairsList = mapper.convertValue(
                        rawUserPairs,
                        new TypeReference<List<Map<String, String>>>() {}
                );
                Map <String, String> actualPairMap = new HashMap<>();
                for(Map<String, String> pair : userPairsList){
                    actualPairMap.putAll(pair);
                }
                System.out.println(actualPairMap);
                System.out.println(correctMap);
                return actualPairMap.equals(correctMap);
            default:
                return false;
        }
    }
    @Override
    public List<QuestionAnalyticsUserDto> getQuestionAnalyticsUsersByParticipantId(String participantId) {

        if (participantId == null) {
            throw new IllegalArgumentException("Participant ID cannot be null");
        }

        UUID pid = UUID.fromString(participantId);

        Participant participant = participantRepository.findById(pid)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));

        Quiz quiz = participant.getQuiz();

        if (quiz.isHoldResult() && quiz.getStatus() != QuizStatus.RESULTS_PUBLISHED) {
            throw new IllegalStateException("Quiz results are not published yet");
        }

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
