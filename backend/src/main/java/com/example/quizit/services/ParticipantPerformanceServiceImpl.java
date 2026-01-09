package com.example.quizit.services;

import com.example.quizit.records.LeaderboardResponse;
import com.example.quizit.repositories.ParticipantPerformanceRepository;
import com.example.quizit.services.interfaces.ParticipantPerformanceService;
import com.example.quizit.services.interfaces.QuestionAnalyticsUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParticipantPerformanceServiceImpl implements ParticipantPerformanceService {

    private final ParticipantPerformanceRepository performanceRepository;

    public List<LeaderboardResponse> getLeaderboard(UUID quizId) {
        return performanceRepository.findLeaderboard(quizId)
                .stream()
                .map(p -> new LeaderboardResponse(
                        p.getParticipant().getParticipantName(),
                        p.getScore(),
                        p.getRank(),
                        p.getTotalTimeSpent()
                ))
                .toList();
    }
}
