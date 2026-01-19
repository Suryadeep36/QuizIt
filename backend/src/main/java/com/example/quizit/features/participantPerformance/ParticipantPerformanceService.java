package com.example.quizit.features.participantPerformance;

import com.example.quizit.records.LeaderboardResponse;

import java.util.List;
import java.util.UUID;

public interface ParticipantPerformanceService {
    public List<LeaderboardResponse> getLeaderboard(UUID quizId);
}
