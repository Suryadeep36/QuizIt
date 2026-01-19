package com.example.quizit.security;

import com.example.quizit.features.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(
        name = "refresh_token",
        indexes = {
            @Index(name = "refresh_tokens_jti_idx",columnList = "jti", unique = true),
            @Index(name = "refresh_tokens_user_idj_idx",columnList = "user_id")
        }
)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true,updatable = false)
    private String jti;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    @Column(nullable = false,updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean revoked;

    private String replacedByToken;
}
