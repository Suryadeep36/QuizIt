package com.example.quizit.controllers;

import com.example.quizit.dtos.*;
import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.question.AnswerKey;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUser;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUserDto;
import com.example.quizit.features.user.User;
import com.example.quizit.security.UserPrincipal;
import com.example.quizit.services.QuizAntiCheatService;
import com.example.quizit.services.QuizTimerService;
import com.example.quizit.features.quizSession.QuizSessionService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class QuizWebSocketController {
    private final QuizSessionService quizSessionService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ModelMapper modelMapper;
    private final QuizTimerService quizTimerService;
    private final QuizAntiCheatService quizAntiCheatService;

    @MessageMapping("/quiz/start/{sessionId}")
    public void startQuiz(@DestinationVariable UUID sessionId, Principal principal) {
        Authentication authentication = (Authentication) principal;
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        QuestionDetailResponse session = quizSessionService.startQuiz(sessionId, userPrincipal.getId());
        WsMessageDto<QuestionDetailResponse> msg = WsMessageDto.<QuestionDetailResponse>builder()
                .messageType("START_QUIZ")
                .payload(session)
                .build();
        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
        quizTimerService.startTimer(sessionId, session.getQuestionForUserDto().getDuration());
    }

    @MessageMapping("/quiz/next/{sessionId}")
    public void nextQuestion(@DestinationVariable UUID sessionId, Principal principal) {
        Authentication authentication = (Authentication) principal;
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        QuestionDetailResponse nextQuestion = quizSessionService.moveToNextQuestion(sessionId, userPrincipal.getId());
        quizTimerService.stopTimer(sessionId);
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

        WsMessageDto<QuestionDetailResponse> msg = WsMessageDto.<QuestionDetailResponse>builder()
                .messageType("NEXT_QUESTION")
                .payload(nextQuestion)
                .build();

        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
        quizTimerService.startTimer(sessionId, nextQuestion.getQuestionForUserDto().getDuration());
    }

    @MessageMapping("/quiz/join/{sessionId}/{participantId}")
    public void joinSession(@DestinationVariable UUID sessionId, @DestinationVariable UUID participantId) {
        ParticipantJoinedMessageDto session = quizSessionService.joinSession(sessionId, participantId);
        quizAntiCheatService.registerParticipant(sessionId, participantId);
        WsMessageDto<ParticipantJoinedMessageDto> msg = WsMessageDto.<ParticipantJoinedMessageDto>builder()
                .messageType("PLAYER_JOINED")
                .payload(session)
                .build();
        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
    }

    @MessageMapping("/quiz/reveal/{sessionId}")
    public void revealAnswer(@DestinationVariable UUID sessionId, Principal principal) {
        Authentication authentication = (Authentication) principal;
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<AnswerKey> correctAnswer = quizSessionService.revealAnswer(sessionId, userPrincipal.getId());
        quizTimerService.stopTimer(sessionId);
        WsMessageDto<List<AnswerKey>> msg = WsMessageDto.<List<AnswerKey>>builder()
                .messageType("REVEAL_ANSWER")
                .payload(correctAnswer)
                .build();


        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
    }

    @MessageMapping("/quiz/submit-answer/{sessionId}")
    public void submitAnswer(@DestinationVariable UUID sessionId, QuestionAnalyticsUserDto questionAnalyticsUserDto){
        WsMessageDto<QuestionAnalyticsUserDto> msg = WsMessageDto.<QuestionAnalyticsUserDto>builder()
                .messageType("SUBMIT_ANSWER")
                .payload(questionAnalyticsUserDto)
                .build();

        simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
    }

    @MessageMapping("/quiz/tab-switch/{sessionId}/{participantId}")
    public void tabSwitch(@DestinationVariable UUID sessionId,
                          @DestinationVariable UUID participantId) {

        quizAntiCheatService.handleTabSwitch(sessionId, participantId);
    }
}
