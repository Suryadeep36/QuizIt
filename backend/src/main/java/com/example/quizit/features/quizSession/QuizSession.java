package com.example.quizit.features.quizSession;

import com.example.quizit.features.user.User;
import com.example.quizit.features.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "quiz_session")
public class QuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "session_id", updatable = false, nullable = false, unique = true)
    private UUID sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_user_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QuizSessionStatus status;

    @Column(name = "current_question_index")
    private Integer currentQuestionIndex;

    @Column(name = "question_started_at")
    private Instant questionStartedAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @PrePersist
    protected void onCreate() {
        this.status = QuizSessionStatus.CREATED;
        this.currentQuestionIndex = -1;
    }
}
