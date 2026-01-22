package com.example.quizit.features.quizSession;

import com.example.quizit.dtos.*;
import com.example.quizit.features.participantSession.ParticipantSessionStatus;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.participantSession.ParticipantSession;
import com.example.quizit.features.participantSession.ParticipantSessionRepository;
import com.example.quizit.features.question.AnswerKey;
import com.example.quizit.features.question.Question;
import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.question.QuestionRepository;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.quiz.QuizRepository;
import com.example.quizit.features.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;


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



    @Override
    public QuizSessionDto createQuizSession(UUID quizId, UUID hostId) {

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));

        if (!quiz.getHost().getId().equals(hostId)) {
            throw new IllegalStateException("Only host can start quiz session");
        }

        QuizSession session = QuizSession.builder()
                .quiz(quiz)
                .host(quiz.getHost())
                .status(QuizSessionStatus.CREATED)
                .currentQuestionIndex(0)
                .startedAt(null)
                .endedAt(null)
                .build();

        quizSessionRepository.save(session);

        return modelMapper.map(session, QuizSessionDto.class);
    }

    @Override
    public UUID getQuizIdBySessionId(UUID sessionId) {
       QuizSession session = quizSessionRepository.findQuizSessionBySessionId(sessionId);
       return session.getQuiz().getQuizId();
    }

    @Override
    public HostReconnectResponse getHostReconnectState(UUID sessionId) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        UUID quizId = session.getQuiz().getQuizId();

        List<ParticipantSession> participantSessionList = participantSessionRepository.getParticipantSessionByQuizSession_SessionId(sessionId);


        List<Question> questions = questionRepository.findByQuiz_QuizId(quizId);
        HostReconnectResponse.HostReconnectResponseBuilder builder = HostReconnectResponse.builder()
                .sessionId(session.getSessionId())
                .quizId(session.getQuiz().getQuizId())
                .status(session.getStatus())
                .totalQuestions(questions.size())
                .participants(participantSessionList)
                .participantCount(participantSessionList.size());


        if (session.getStatus() == QuizSessionStatus.STARTED) {
            builder.currentQuestionIndex(session.getCurrentQuestionIndex());
            QuestionForUserDto currentQuestion = convertToUserDto(questions.get(session.getCurrentQuestionIndex()));
            builder.currentQuestionState(currentQuestion);
        }

        return builder.build();
    }

    @Override
    public QuestionForUserDto startQuiz(UUID sessionId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getStatus().equals(QuizSessionStatus.CREATED)) {
            throw new IllegalStateException("Quiz already started or ended");
        }

        session.setStatus(QuizSessionStatus.STARTED);
        session.setStartedAt(Instant.now());
        session.setCurrentQuestionIndex(0);

        quizSessionRepository.save(session);

        UUID quizId = session.getQuiz().getQuizId();

        List<Question> questions = questionRepository.findByQuiz_QuizId(quizId);

        if (questions.isEmpty()) {
            throw new IllegalStateException("No questions found for this quiz!");
        }

        Question firstQuestion = questions.get(0);

        return convertToUserDto(firstQuestion);
    }


    private QuestionForUserDto convertToUserDto(Question q) {
        return QuestionForUserDto.builder()
                .questionId(q.getQuestionId())
                .quizId(q.getQuiz().getQuizId())
                .content(q.getContent())
                .options(q.getOptions())
                .duration(q.getDuration())
                .questionType(q.getQuestionType())
                .build();
    }



    @Override
    public QuestionForUserDto moveToNextQuestion(UUID sessionId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getStatus().equals(QuizSessionStatus.STARTED)) {
            throw new IllegalStateException("Quiz is not live");
        }

        UUID quizId = session.getQuiz().getQuizId();

        long totalQuestions = questionRepository.countQuestionByQuiz_QuizId(quizId);

        // if next index EXCEEDS total — end quiz
        int nextIndex = session.getCurrentQuestionIndex() + 1;

        if (nextIndex >= totalQuestions) {
            endQuiz(sessionId);
            return null; // or return a special DTO indicating quiz ended
        }

        // update index
        session.setCurrentQuestionIndex(nextIndex);
        quizSessionRepository.save(session);

        // fetch next question
        List<Question> questions = questionRepository.findByQuiz_QuizId(quizId);
        Question nextQuestion = questions.get(nextIndex);

        return convertToUserDto(nextQuestion);
    }



    @Override
    public QuizSessionDto endQuiz(UUID sessionId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

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

        boolean alreadyJoined = participantSessionRepository
                .existsByQuizSessionAndParticipant(session, participant);

        if (alreadyJoined) {
            throw new IllegalStateException("Participant already joined this session");
        }

        ParticipantSession participantSession = ParticipantSession.builder()
                .quizSession(session)
                .participant(participant)
                .status(ParticipantSessionStatus.JOINED)
                .joinedAt(Instant.now())
                .score(0)
                .build();

        participantSessionRepository.save(participantSession);
        ParticipantJoinedMessageDto participantJoinedMessageDto = ParticipantJoinedMessageDto.builder()
                .messageType("PLAYER_JOINED")
                .sessionId(sessionId)
                .participantId(participantId)
                .name(participant.getParticipantName())
                .build();

        return participantJoinedMessageDto;
    }

    @Override
    public List<AnswerKey> revealAnswer(UUID sessionId) {
        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (!session.getStatus().equals(QuizSessionStatus.STARTED)) {
            throw new IllegalStateException("Quiz is not live");
        }

        UUID quizId = session.getQuiz().getQuizId();
        List<Question> questions = questionRepository.findByQuiz_QuizId(quizId);
        Question nextQuestion = questions.get(session.getCurrentQuestionIndex());
        return nextQuestion.getCorrectAnswer();
    }
}