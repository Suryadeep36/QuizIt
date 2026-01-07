package com.example.quizit.services;

import com.example.quizit.dtos.QuizSessionDto;
import com.example.quizit.entities.*;
import com.example.quizit.enums.ParticipantSessionStatus;
import com.example.quizit.enums.ParticipantStatus;
import com.example.quizit.enums.QuizSessionStatus;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.repositories.*;
import com.example.quizit.services.interfaces.QuizSessionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
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
    public QuizSessionDto findQuizSessionBySessionId(UUID sessionId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        return modelMapper.map(session, QuizSessionDto.class);
    }

    @Override
    public QuizSessionDto startQuiz(UUID sessionId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (session.getStatus() != QuizSessionStatus.CREATED) {
            throw new IllegalStateException("Quiz already started or ended");
        }

        session.setStatus(QuizSessionStatus.STARTED);
        session.setStartedAt(Instant.now());
        session.setCurrentQuestionIndex(0);

        quizSessionRepository.save(session);

        return modelMapper.map(session, QuizSessionDto.class);
    }

    @Override
    public QuizSessionDto moveToNextQuestion(UUID sessionId) {

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (session.getStatus() != QuizSessionStatus.STARTED) {
            throw new IllegalStateException("Quiz is not live");
        }

        long totalQuestions = questionRepository.countQuestionByQuiz_QuizId(
                session.getQuiz().getQuizId()
        );

        if (session.getCurrentQuestionIndex() + 1 >= totalQuestions) {
            return endQuiz(sessionId);
        }

        session.setCurrentQuestionIndex(
                session.getCurrentQuestionIndex() + 1
        );

        quizSessionRepository.save(session);

        return modelMapper.map(session, QuizSessionDto.class);
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
    public QuizSessionDto joinSession(UUID sessionId, UUID participantId) {

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

        return modelMapper.map(session, QuizSessionDto.class);
    }
}

