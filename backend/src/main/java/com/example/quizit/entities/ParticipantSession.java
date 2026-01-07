package com.example.quizit.entities;

import com.example.quizit.enums.ParticipantSessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "participant_session")
public class ParticipantSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "participant_session_id", updatable = false)
    private UUID participantSessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    private QuizSession quizSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ParticipantSessionStatus status;
    // JOINED, ANSWERED, DISCONNECTED

    @Column(name = "current_score")
    private Integer score = 0;

    @Column(name = "last_answer")
    private String lastAnswer;

    @Column(name = "answered_at")
    private Instant answeredAt;

    @Column(name = "joined_at", updatable = false)
    private Instant joinedAt;

    @PrePersist
    protected void onCreate() {
        this.joinedAt = Instant.now();
        this.status = ParticipantSessionStatus.JOINED;
        this.score = 0;
    }
}