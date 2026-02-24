package com.example.quizit.features.quiz;

import com.example.quizit.features.allowedUser.AllowedUser;
import com.example.quizit.features.question.Question;
import com.example.quizit.features.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(
        name = "quiz",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_quiz_name_per_host",
                        columnNames = {"quiz_name", "host_user_id"}
                )
        }
)
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quiz_id", updatable = false, nullable = false)
    private UUID quizId;

    @Column(name = "quiz_name", nullable = false)
    private String quizName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_user_id", nullable = false)
    private User host;

    @Enumerated(EnumType.STRING)
    private QuizStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false)
    private QuizMode mode;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Column(name = "allow_guest")
    private boolean allowGuest;

    @Column(name = "shuffle_questions")
    private boolean shuffleQuestions;

    @Column(name = "show_leaderboard")
    private boolean showLeaderboard;

    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @Column(nullable = false, name = "allow_all_authenticated")
    private boolean allowAllAuthenticated;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    @OneToMany(mappedBy = "quiz",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @OneToMany(mappedBy = "quiz",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<AllowedUser> allowedUsers = new ArrayList<>();
}


