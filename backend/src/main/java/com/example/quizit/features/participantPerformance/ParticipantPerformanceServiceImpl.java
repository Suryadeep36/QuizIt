package com.example.quizit.features.participantPerformance;

import com.example.quizit.records.LeaderboardResponse;
import lombok.RequiredArgsConstructor;
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
                        p.getParticipant().getParticipantId(),
                        p.getParticipant().getParticipantName(),
                        p.getScore(),
                        p.getRank(),
                        p.getTotalTimeSpent()
                ))
                .toList();
    }
}
