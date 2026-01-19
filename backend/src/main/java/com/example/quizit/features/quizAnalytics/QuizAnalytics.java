package com.example.quizit.features.quizAnalytics;

import com.example.quizit.features.user.User;
import com.example.quizit.features.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "quiz_analytics")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quiz_analytics_id")
    private UUID quizAnalyticsId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "quiz_id",
            referencedColumnName = "quiz_id",
            nullable = false,
            unique = true
    )
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "winner_user_id",
            referencedColumnName = "user_id"
    )
    private User winnerUser;

    @Column(name = "average_score")
    private float averageScore;

    @Column(name = "total_duration")
    private long totalDuration;
}
