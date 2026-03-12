package com.example.quizit.features.user;


import com.example.quizit.features.role.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class UserDto {

    private UUID id;

    private String email;
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;


    private String image;

    private Boolean enable;
    private Instant createdAt;
    private Instant updatedAt;

    private Provider provider;
    private UserStatus status;
    private Set<String> roles;

}
