package com.example.quizit.services;

import com.example.quizit.dtos.ParticipantCheatMsg;
import com.example.quizit.dtos.WsMessageDto;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUserDto;
import com.example.quizit.records.ParticipantAntiCheatState;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class QuizAntiCheatService {
    private final SimpMessagingTemplate simpMessagingTemplate;
    Map <UUID, Map<UUID, ParticipantAntiCheatState>> antiCheatSessions = new ConcurrentHashMap<>();
    private static final int TAB_LIMIT = 3;

    public void registerParticipant(UUID sessionId, UUID participantId){
        System.out.println("Register participant " + participantId + " session" + sessionId);
        antiCheatSessions
                .computeIfAbsent(sessionId, id -> new ConcurrentHashMap<>())
                .put(participantId, new ParticipantAntiCheatState());
    }

    public void handleTabSwitch(UUID sessionId, UUID participantId){
        System.out.println("handle tab switch");
        Map<UUID, ParticipantAntiCheatState> participants = antiCheatSessions.get(sessionId);
        if(participants == null) return;

        ParticipantAntiCheatState state = participants.get(participantId);
        if(state == null) return;
        int count = state.increment(TAB_LIMIT);
        System.out.println("new value " + participantId + " " + participants.get(participantId).getTabSwitches());
//        if(state.isBlocked()){
//            ParticipantCheatMsg.ParticipantCheatMsgBuilder builder = ParticipantCheatMsg.builder()
//                    .participantId(participantId)
//                    .sessionId(sessionId)
//                    .tabSwitches(count);
//            WsMessageDto<ParticipantCheatMsg> msg = WsMessageDto.<ParticipantCheatMsg>builder()
//                    .messageType("CHEAT_DETECTED")
//                    .payload(builder.build())
//                    .build();
//
//            simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
//        }
    }

    public Map<UUID, ParticipantAntiCheatState> consumeSession(UUID sessionId){
        System.out.println("consume session called " + sessionId);
        return antiCheatSessions.remove(sessionId);
    }

    public int getTabSwitchCount(UUID sessionId, UUID participantId) {
        System.out.println("Get tab switch called " + sessionId + " " + participantId);
        Map<UUID, ParticipantAntiCheatState> participants = antiCheatSessions.get(sessionId);
        if (participants == null) return 0;

        ParticipantAntiCheatState state = participants.get(participantId);
        if (state == null) return 0;

        return state.getTabSwitches();
    }

}
