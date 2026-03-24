package com.example.quizit.features.quizSession;

import com.example.quizit.dtos.*;
import com.example.quizit.features.participantSession.ParticipantSessionDto;
import com.example.quizit.features.participantSession.ParticipantSessionStatus;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.participantSession.ParticipantSession;
import com.example.quizit.features.participantSession.ParticipantSessionRepository;
import com.example.quizit.features.question.*;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUser;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUserRepository;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.user.UserRepository;
import com.example.quizit.services.QuizAntiCheatService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;


@Service
@RequiredArgsConstructor
@Transactional
public class QuizSessionServiceImpl implements QuizSessionService {

    private final QuizSessionRepository quizSessionRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final ParticipantSessionRepository participantSessionRepository;
    private final ParticipantRepository participantRepository;
    private final ModelMapper modelMapper;
    private final QuestionAnalyticsUserRepository questionAnalyticsUserRepository;
    private final JsonMapper.Builder builder;
    private final QuizAntiCheatService quizAntiCheatService;


    @Override
    public QuizSessionDto createQuizSession(UUID quizId, UUID hostId) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        if (!quiz.getHost().getId().equals(hostId)) {
            throw new IllegalStateException("Only host can start quiz session");
        }

        QuizSession session = QuizSession.builder()
                .quiz(quiz)
                //joincode
                .joinCode(generateUniqueJoinCode())
                .host(quiz.getHost())
                .status(QuizSessionStatus.CREATED)
                .currentQuestionIndex(0)
                .startedAt(null)
                .endedAt(null)
                .build();

        quizSessionRepository.save(session);


        return modelMapper.map(session, QuizSessionDto.class);
    }

    //joincode
    private String generateUniqueJoinCode() {
        String code;
        int attempts = 0;

        do {
            code = randomCode();
            attempts++;
        } while (quizSessionRepository.existsByJoinCode(code) && attempts < 5);

        if (attempts == 5) {
            throw new IllegalStateException("Unable to generate unique join code");
        }

        return code;
    }

    //joincode
    private String randomCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();

        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public UUID getQuizIdBySessionId(UUID sessionId) {
        QuizSession session = quizSessionRepository.findQuizSessionBySessionId(sessionId);
        return session.getQuiz().getQuizId();
    }

    @Override
    public JoinQuizDto getQuizIdSessionIdByJoinCode(String joinCode) {
        QuizSession session = quizSessionRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new ResourceNotFoundException("Join code not found!"));

        return modelMapper.map(session, JoinQuizDto.class);
    }


    @Override
    public HostReconnectResponse getHostReconnectState(UUID sessionId) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        UUID quizId = session.getQuiz().getQuizId();

        List<ParticipantSession> participantSessionList = participantSessionRepository.getParticipantSessionByQuizSession_SessionId(sessionId);
        List<ParticipantSessionDto> dtoList = participantSessionList.stream()
                .map(ps -> new ParticipantSessionDto(
                        ps.getParticipantSessionId(), ps.getParticipant().getParticipantId(),
                        ps.getParticipant().getParticipantName(),
                        ps.getStatus(),
                        ps.getScore()
                ))
                .toList();
        List<Question> questions = questionRepository.findByQuiz_QuizIdOrderByDisplayOrder(quizId);
        HostReconnectResponse.HostReconnectResponseBuilder builder = HostReconnectResponse.builder()
                .sessionId(session.getSessionId())
                .quizId(session.getQuiz().getQuizId())
                .status(session.getStatus())
                .joinCode(session.getJoinCode())
                .totalQuestions(questions.size())
                .participants(dtoList)
                .participantCount(participantSessionList.size());


        if (session.getStatus() == QuizSessionStatus.STARTED) {
            builder.currentQuestionIndex(session.getCurrentQuestionIndex());
            QuestionForUserDto currentQuestion = convertToUserDto(questions.get(session.getCurrentQuestionIndex()));
            builder.currentQuestionState(currentQuestion);
        }
        if (session.getStatus() == QuizSessionStatus.REVEALED) {
            builder.currentQuestionIndex(session.getCurrentQuestionIndex());
            Question question = questions.get(session.getCurrentQuestionIndex());
            QuestionForUserDto currentQuestion = convertToUserDto(question);
            builder.currentQuestionState(currentQuestion);
            builder.correctAnswer(question.getCorrectAnswer());
        }
        return builder.build();
    }

    @Override
    public ParticipantReconnectResponse getParticipantReconnectState(UUID participantId, UUID sessionId) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        UUID quizId = session.getQuiz().getQuizId();

        List<Question> questions =
                questionRepository.findByQuiz_QuizIdOrderByDisplayOrder(quizId);

        List<ParticipantSession> participantSessions =
                participantSessionRepository
                        .getParticipantSessionByQuizSession_SessionId(sessionId);

        int tabSwitchesCount = quizAntiCheatService.getTabSwitchCount(sessionId, participantId);
        ParticipantReconnectResponse.ParticipantReconnectResponseBuilder builder =
                ParticipantReconnectResponse.builder()
                        .sessionId(session.getSessionId())
                        .quizId(quizId)
                        .status(session.getStatus())
                        .joinCode(session.getJoinCode())
                        .totalQuestions(questions.size())
                        .participantCount(participantSessions.size())
                        .tabSwitches(tabSwitchesCount);

        if (session.getStatus() == QuizSessionStatus.STARTED
                || session.getStatus() == QuizSessionStatus.REVEALED) {

            Integer index = session.getCurrentQuestionIndex();
            builder.currentQuestionIndex(index);

            Question currentQuestion = questions.get(index);
            QuestionForUserDto currentQuestionForUserDto = convertToUserDto(currentQuestion);
            List<OptionDto> shuffledOptions = getShuffledOptions(currentQuestion, sessionId, session.getQuiz().isShuffleQuestions());
            currentQuestionForUserDto.setShuffledOptionList(shuffledOptions);
            builder.currentQuestionState(currentQuestionForUserDto);
            Optional<QuestionAnalyticsUser> analytics = questionAnalyticsUserRepository.findByParticipant_ParticipantIdAndQuestion_QuestionId(participantId, currentQuestion.getQuestionId());
            analytics.ifPresent((qau) -> {
                builder.selectedAnswer(qau.getSelectedAnswer());
                builder.isCorrect((qau.getIsCorrect()));
                System.out.println(qau.getSelectedAnswer());
            });

            if (session.getStatus() == QuizSessionStatus.REVEALED) {
                builder.correctAnswer(currentQuestion.getCorrectAnswer());
            }
        }
        return builder.build();
    }

    @Override
    public QuestionDetailResponse startQuiz(UUID sessionId, UUID hostId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getStatus().equals(QuizSessionStatus.CREATED)) {
            throw new IllegalStateException("Quiz already started or ended");
        }

        if (!session.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("quiz not found");
        }
        session.setStatus(QuizSessionStatus.STARTED);
        session.setStartedAt(Instant.now());
        session.setCurrentQuestionIndex(0);

        quizSessionRepository.save(session);

        UUID quizId = session.getQuiz().getQuizId();

        List<Question> questions = questionRepository.findByQuiz_QuizIdOrderByDisplayOrder(quizId);

        if (questions.isEmpty()) {
            throw new IllegalStateException("No questions found for this quiz!");
        }

        Question firstQuestion = questions.get(0);
        QuestionForUserDto questionForUserDto = convertToUserDto(firstQuestion);
        List<OptionDto> shuffledOptions = getShuffledOptions(firstQuestion, sessionId, session.getQuiz().isShuffleQuestions());
        questionForUserDto.setShuffledOptionList(shuffledOptions);
        QuestionDetailResponse.QuestionDetailResponseBuilder builder = QuestionDetailResponse.builder()
                .questionForUserDto(questionForUserDto)
                .totalQuestions(questions.size())
                .currentQuestionIndex(session.getCurrentQuestionIndex());
        return builder.build();
    }

    public List<OptionDto> getShuffledOptions(Question question, UUID participantId, boolean isShuffledOptions) {

        Map<String, Object> options = question.getOptions();

        List<OptionDto> optionList = new ArrayList<>(options.entrySet()
                .stream()
                .map(e -> new OptionDto(e.getKey(), e.getValue().toString()))
                .toList());
        if(isShuffledOptions){
            Collections.shuffle(optionList, new Random(participantId.hashCode()));
        }
        return optionList;
    }


    private QuestionForUserDto convertToUserDto(Question q) {
        return QuestionForUserDto.builder()
                .questionId(q.getQuestionId())
                .quizId(q.getQuiz().getQuizId())
                .content(q.getContent())
                .options(q.getOptions())
                .duration(q.getDuration())
                .questionType(q.getQuestionType())
                .imageUrl(q.getImageUrl())
                .displayOrder(q.getDisplayOrder())
                .allowMultipleAnswers(q.getAllowMultipleAnswers())
                .build();
    }


    @Override
    public QuestionDetailResponse moveToNextQuestion(UUID sessionId, UUID hostId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getStatus().equals(QuizSessionStatus.STARTED) && !session.getStatus().equals(QuizSessionStatus.REVEALED)) {
            throw new IllegalStateException("Quiz is not live");
        }

        if (!session.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("quiz not found");
        }

        session.setStatus(QuizSessionStatus.STARTED);
        UUID quizId = session.getQuiz().getQuizId();
        long totalQuestions = questionRepository.countQuestionByQuiz_QuizId(quizId);

        int nextIndex = session.getCurrentQuestionIndex() + 1;
        if (nextIndex >= totalQuestions) {
            endQuiz(sessionId, session.getHost().getId());
            return null;
        }

        session.setCurrentQuestionIndex(nextIndex);
        quizSessionRepository.save(session);

        List<Question> questions = questionRepository.findByQuiz_QuizIdOrderByDisplayOrder(quizId);
        Question nextQuestion = questions.get(nextIndex);
        QuestionForUserDto questionForUserDto = convertToUserDto(nextQuestion);
        List<OptionDto> shuffledOptions = getShuffledOptions(nextQuestion, sessionId, session.getQuiz().isShuffleQuestions());
        questionForUserDto.setShuffledOptionList(shuffledOptions);
        QuestionDetailResponse.QuestionDetailResponseBuilder builder = QuestionDetailResponse.builder()
                .questionForUserDto(questionForUserDto)
                .totalQuestions(questions.size())
                .currentQuestionIndex(session.getCurrentQuestionIndex());
        return builder.build();
    }


    @Override
    public QuizSessionDto endQuiz(UUID sessionId, UUID hostId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("quiz not found");
        }
        session.setStatus(QuizSessionStatus.ENDED);
        session.setEndedAt(Instant.now());
        quizSessionRepository.save(session);

        return modelMapper.map(session, QuizSessionDto.class);
    }


    @Override
    public ParticipantJoinedMessageDto joinSession(UUID sessionId, UUID participantId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (session.getStatus() == QuizSessionStatus.ENDED) {
            throw new IllegalStateException("Quiz already ended");
        }

        Participant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException("Participant not found"));

        if (!participant.getQuiz().getQuizId().equals(session.getQuiz().getQuizId())) {
            throw new IllegalStateException("Participant does not belong to this quiz");
        }

        ParticipantSession participantSession =
                participantSessionRepository.findByQuizSessionAndParticipant(session, participant);

        if (participantSession != null) {

            participantSession.setStatus(ParticipantSessionStatus.JOINED);
            participantSession.setJoinedAt(Instant.now());
            participantSessionRepository.save(participantSession);

        } else {

            ParticipantSession newParticipantSession = ParticipantSession.builder()
                    .quizSession(session)
                    .participant(participant)
                    .status(ParticipantSessionStatus.JOINED)
                    .joinedAt(Instant.now())
                    .score(0)
                    .build();

            participantSessionRepository.save(newParticipantSession);
        }

        ParticipantJoinedMessageDto participantJoinedMessageDto = ParticipantJoinedMessageDto.builder()
                .messageType("PLAYER_JOINED")
                .sessionId(sessionId)
                .participantId(participantId)
                .name(participant.getParticipantName())
                .build();

        return participantJoinedMessageDto;
    }

    @Override
    public List<AnswerKey> revealAnswer(UUID sessionId, UUID hostId) {
        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getStatus().equals(QuizSessionStatus.STARTED) && !session.getStatus().equals(QuizSessionStatus.REVEALED)) {
            throw new IllegalStateException("Quiz is not live");
        }

        if (!session.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("quiz not found");
        }
        session.setStatus(QuizSessionStatus.REVEALED);

        UUID quizId = session.getQuiz().getQuizId();
        List<Question> questions = questionRepository.findByQuiz_QuizIdOrderByDisplayOrder(quizId);
        Question nextQuestion = questions.get(session.getCurrentQuestionIndex());
        return nextQuestion.getCorrectAnswer();
    }
}