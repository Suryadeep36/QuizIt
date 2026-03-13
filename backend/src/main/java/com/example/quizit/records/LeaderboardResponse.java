package com.example.quizit.records;

import java.util.UUID;

public record LeaderboardResponse(
        UUID participantId,
        String participantName,
        Integer score,
        Integer rank,
        Long totalTimeSpent,
        Float cheatingRiskScore
) {}
