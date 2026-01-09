package com.example.quizit.records;

public record LeaderboardResponse(
        String participantName,
        Integer score,
        Integer rank,
        Long totalTimeSpent
) {}
