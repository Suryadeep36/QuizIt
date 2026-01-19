package com.example.quizit.services;

import com.example.quizit.dtos.TimerUpdateDto;
import com.example.quizit.dtos.WsMessageDto;
import com.example.quizit.features.quizSession.QuizSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class QuizTimerService {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final QuizSessionService quizSessionService;

    private final Map<UUID, ScheduledFuture<?>> activeTimers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);

    public void startTimer(UUID sessionId, int durationSeconds){
        stopTimer(sessionId);

        AtomicInteger remainingSeconds = new AtomicInteger(durationSeconds);
        ScheduledFuture<?> timerTask = scheduler.scheduleAtFixedRate(() -> {
            int remaining = remainingSeconds.getAndDecrement();

            if (remaining >= 1) {
                // Broadcast remaining time to all participants
                WsMessageDto<TimerUpdateDto> msg = WsMessageDto.<TimerUpdateDto>builder()
                        .messageType("TIMER_UPDATE")
                        .payload(TimerUpdateDto.builder()
                                .remainingSeconds(remaining)
                                .build())
                        .build();

                simpMessagingTemplate.convertAndSend("/topic/quiz/" + sessionId, msg);
            } else {
                stopTimer(sessionId);
            }

        }, 0, 1, TimeUnit.SECONDS);

        activeTimers.put(sessionId, timerTask);

    }

    public void stopTimer(UUID sessionId) {
        ScheduledFuture<?> timer = activeTimers.remove(sessionId);
        if (timer != null) {
            timer.cancel(false);
        }
    }

    public void cleanupSession(UUID sessionId) {
        stopTimer(sessionId);
    }
}
