package com.example.quizit.controllers;

import com.example.quizit.dtos.*;
import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.services.QuizTimerService;
import com.example.quizit.features.quizSession.QuizSessionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class QuizWebSocketController {
    private final QuizSessionService quizSessionService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ModelMapper modelMapper;
    private final QuizTimerService quizTimerService;

    @MessageMapping("/quiz/start/{sessionId}")
    public void startQuiz(@DestinationVariable UUID sessionId) {
        QuestionForUserDto session = quizSessionService.startQuiz(sessionId);
        WsMessageDto<QuestionForUserDto> msg = WsMessageDto.<QuestionForUserDto>builder()
                .messageType("START_QUIZ")
                .payload(session)
                .build();
        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
        quizTimerService.startTimer(sessionId, session.getDuration());
    }

    @MessageMapping("/quiz/next/{sessionId}")
    public void nextQuestion(@DestinationVariable UUID sessionId) {
        quizTimerService.stopTimer(sessionId);
        QuestionForUserDto nextQuestion = quizSessionService.moveToNextQuestion(sessionId);

        if (nextQuestion == null) {
            UUID quizId = quizSessionService.getQuizIdBySessionId(sessionId);
            EndQuizMsg endQuizMsg = EndQuizMsg.builder()
                    .quizId(quizId)
                    .build();
            WsMessageDto<EndQuizMsg> endedMsg = WsMessageDto.<EndQuizMsg>builder()
                    .messageType("QUIZ_ENDED")
                    .payload(endQuizMsg)
                    .build();
            simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, endedMsg);
            return;
        }

        WsMessageDto<QuestionForUserDto> msg = WsMessageDto.<QuestionForUserDto>builder()
                .messageType("NEXT_QUESTION")
                .payload(nextQuestion)
                .build();

        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
        quizTimerService.startTimer(sessionId, nextQuestion.getDuration());
    }
    @MessageMapping("/quiz/join/{sessionId}/{participantId}")
    public void joinSession(@DestinationVariable UUID sessionId, @DestinationVariable UUID participantId) {
        ParticipantJoinedMessageDto session = quizSessionService.joinSession(sessionId, participantId);
        WsMessageDto<ParticipantJoinedMessageDto> msg = WsMessageDto.<ParticipantJoinedMessageDto>builder()
                .messageType("PLAYER_JOINED")
                .payload(session)
                .build();
        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
    }

    @MessageMapping("/quiz/reveal/{sessionId}")
    public void revealAnswer(@DestinationVariable UUID sessionId) {
        quizTimerService.stopTimer(sessionId);
        Map<String, Object> correctAnswer = quizSessionService.revealAnswer(sessionId);
        WsMessageDto<Map<String, Object>> msg = WsMessageDto.<Map<String, Object>>builder()
                .messageType("REVEAL_ANSWER")
                .payload(correctAnswer)
                .build();

        System.out.println(">> REVEAL CALLED: " + msg);

        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
    }
}
