package com.example.quizit.features.registeredUser;


import com.example.quizit.features.participant.Participant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;
import com.example.quizit.features.allowedUser.AllowedUser;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisteredUser {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "registration_id")
    private UUID registrationId;

    private String name;

    private String email;

    private LocalDate birthdate;

    @Column(name = "enrollment_id")
    private String enrollmentId;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false, unique = true)
    private Participant participant;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allowed_user_id", nullable = false,unique = true)
    private AllowedUser allowedUser;

    private Instant registeredAt;
}