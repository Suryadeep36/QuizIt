package com.example.quizit.features.participantPerformance;


import com.example.quizit.records.LeaderboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/quizit")
@RequiredArgsConstructor
public class ParticipantPerformanceController {
    private final ParticipantPerformanceService participantPerformanceService;

    @GetMapping("quiz/{quizId}/leaderboard")
    public List<LeaderboardResponse> getLeaderboard(
            @PathVariable UUID quizId
    ) {
        return participantPerformanceService.getLeaderboard(quizId);
    }
}
