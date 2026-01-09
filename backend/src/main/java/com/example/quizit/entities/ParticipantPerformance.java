package com.example.quizit.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.util.UUID;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(
        name = "participant_performance",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"participant_id", "quiz_id"})
        }
)
public class ParticipantPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "performance_id", nullable = false, updatable = false)
    private UUID performanceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private Integer score;
    private Integer rank;

    @Column(name = "total_time_spent")
    private Long totalTimeSpent;

    private Float cheatingRiskScore;

}
