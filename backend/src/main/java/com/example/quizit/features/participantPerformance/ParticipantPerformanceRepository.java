package com.example.quizit.features.participantPerformance;

import com.example.quizit.features.quiz.Quiz;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ParticipantPerformanceRepository extends JpaRepository<ParticipantPerformance, UUID> {

    List<ParticipantPerformance> findAllByQuiz(Quiz quiz);

    @Query("""
        SELECT p
        FROM ParticipantPerformance p
        WHERE p.quiz.quizId = :quizId
        ORDER BY p.score DESC, p.totalTimeSpent ASC
    """)
    List<ParticipantPerformance> findLeaderboard(@Param("quizId") UUID quizId);

    @Modifying
    @Transactional
    @Query(
            value = """
        UPDATE participant_performance pp
        SET rank = ranked.rank
        FROM (
            SELECT
                performance_id,
                RANK() OVER (
                    PARTITION BY quiz_id
                    ORDER BY score DESC, total_time_spent ASC
                ) AS rank
            FROM participant_performance
            WHERE quiz_id = :quizId
        ) ranked
        WHERE pp.performance_id = ranked.performance_id
        """,
            nativeQuery = true
    )
    void assignRanksByQuizId(UUID quizId);
}
