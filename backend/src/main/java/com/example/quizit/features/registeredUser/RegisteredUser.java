package com.example.quizit.features.registeredUser;


import com.example.quizit.features.participant.Participant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    private String birthdate;

    @Column(name = "enrollment_id")
    private String enrollmentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false, unique = true)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allowed_user_id", nullable = false,unique = true)
    private AllowedUser allowedUser;
}