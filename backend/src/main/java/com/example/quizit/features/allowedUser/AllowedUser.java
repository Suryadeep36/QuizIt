package com.example.quizit.features.allowedUser;

import com.example.quizit.features.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "quiz_allowed_users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"quiz_id", "email"}),
                @UniqueConstraint(columnNames = {"token"})
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllowedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "allowed_user_id")
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(unique = true)
    private String token;

    @Column(nullable = false)
    private boolean registered = false;


    private Instant tokenExpiry;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Column(name = "invitation_status")
    @Enumerated(EnumType.STRING)
    private InvitationStatus invitationStatus;

    private Instant invitationSentAt;

    private String deliveryErrorMessage;

}