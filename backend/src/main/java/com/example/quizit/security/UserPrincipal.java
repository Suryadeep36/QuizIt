package com.example.quizit.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;

import java.security.Principal;
import java.util.Collection;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserPrincipal implements Principal {
    private UUID id;
    private String email;
    private Collection<? extends GrantedAuthority> authorities;
    @Override
    public String getName() {
        return id.toString();
    }
}
