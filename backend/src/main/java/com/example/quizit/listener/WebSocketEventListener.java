package com.example.quizit.listener;

import com.example.quizit.dtos.WsMessageDto;
import com.example.quizit.exceptions.ResourceNotFoundException;
import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.participant.ParticipantRepository;
import com.example.quizit.features.participantSession.ParticipantSession;
import com.example.quizit.features.participantSession.ParticipantSessionRepository;
import com.example.quizit.features.participantSession.ParticipantSessionStatus;
import com.example.quizit.features.quizSession.QuizSession;
import com.example.quizit.features.quizSession.QuizSessionRepository;
import com.example.quizit.features.quizSession.QuizSessionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ParticipantSessionRepository participantSessionRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final ParticipantRepository participantRepository;

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        System.out.println("DISCONNECTED event");
        System.out.println(event.getMessage());
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();

        if (sessionAttributes == null) return;

        UUID sessionId = (UUID) sessionAttributes.get("quizSessionId");
        UUID participantId = (UUID) sessionAttributes.get("participantId");

        if (sessionId == null || participantId == null) return;

        QuizSession session = quizSessionRepository.findBySessionId(sessionId)
                .orElse(null);

        if (session == null || session.getStatus() == QuizSessionStatus.ENDED) {
            return;
        }

        Participant participant = participantRepository.findById(participantId)
                .orElse(null);

        if (participant == null) return;

        if (!participant.getQuiz().getQuizId().equals(session.getQuiz().getQuizId())) {
            return;
        }

        ParticipantSession participantSession =
                participantSessionRepository.findByQuizSessionAndParticipant(session, participant);

        if (participantSession == null) return;

        participantSession.setStatus(ParticipantSessionStatus.DISCONNECTED);
        participantSessionRepository.save(participantSession);
        System.out.println("Marked as disconnected");
        WsMessageDto<UUID> msg = WsMessageDto.<UUID>builder()
                .messageType("PLAYER_LEFT")
                .payload(participantId)
                .build();

        messagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
    }
}