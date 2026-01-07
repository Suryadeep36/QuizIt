package com.example.quizit.controllers;

import com.example.quizit.dtos.QuizSessionDto;
import com.example.quizit.entities.QuizSession;
import com.example.quizit.services.interfaces.QuizSessionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class QuizWebSocketController {
    private final QuizSessionService quizSessionService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ModelMapper modelMapper;

    @MessageMapping("/quiz/start/{sessionId}")
    public void startQuiz(@DestinationVariable UUID sessionId) {
        QuizSessionDto session = quizSessionService.startQuiz(sessionId);
        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, session);
    }

    @MessageMapping("/quiz/next/{sessionId}")
    public void nextQuestion(@DestinationVariable UUID sessionId) {
        QuizSessionDto session = quizSessionService.moveToNextQuestion(sessionId);
        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, session);
    }

    @MessageMapping("/quiz/join/{sessionId}/{participantId}")
    public void joinSession(@DestinationVariable UUID sessionId, @DestinationVariable UUID participantId) {
        QuizSessionDto session = quizSessionService.joinSession(sessionId, participantId);
        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, session);
    }
}
