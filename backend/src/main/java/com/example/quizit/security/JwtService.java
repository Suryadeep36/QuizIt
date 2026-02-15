package com.example.quizit.security;


import com.example.quizit.features.role.Role;
import com.example.quizit.features.user.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
@Getter
@Setter
public class JwtService {

    private final SecretKey key;
    private final long accessTokenValiditySeconds;
    private final long refreshTokenValiditySeconds;
    private final String issuer;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-ttl-seconds}") long accessTokenValiditySeconds,
            @Value("${security.jwt.refresh-ttl-seconds}") long refreshTokenValiditySeconds,
            @Value("${security.jwt.issuer}") String issuer) {

        if (secret == null || secret.length() < 64) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least 64 characters long"
            );
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValiditySeconds = accessTokenValiditySeconds;
        this.refreshTokenValiditySeconds = refreshTokenValiditySeconds;
        this.issuer = issuer;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();


        List<String> roles = new ArrayList<>();
        if (user.getRoles() != null) {
            roles = user.getRoles()
                    .stream()
                    .map(Role::getName)
                    .toList();
        }


        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenValiditySeconds))) // ChatGPT
                .claims(
                        Map.of(
                                "email", user.getEmail(),
                                "roles", roles, // ChatGPT
                                "type", "access"
                        )
                )
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(User user, String jti) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshTokenValiditySeconds))) // ChatGPT
                .claim("type", "refresh")
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser() // ChatGPT
                .setSigningKey(key)  // ChatGPT
                .build()             // ChatGPT
                .parseSignedClaims(token);
    }

    public boolean isAccessToken(String token) {

            Claims c = parse(token).getPayload(); // ChatGPT
            return "access".equals(c.get("type"));

    }

    public boolean isRefreshToken(String token) {
            Claims c = parse(token).getPayload(); // ChatGPT
            return "refresh".equals(c.get("type"));


    }

    public UUID getUserId(String token) {
        try {
            Claims c = parse(token).getPayload(); // ChatGPT
            return UUID.fromString(c.getSubject());
        } catch (JwtException e) {
            return null; // ChatGPT
        }
    }

    public String getJti(String token) {
        try {
            Claims c = parse(token).getPayload(); // ChatGPT
            return c.getId();
        } catch (JwtException e) {
            return null; // ChatGPT
        }
    }

    public List<String> getRoles(String token) {
        try {
            Claims c = parse(token).getPayload(); // ChatGPT
            return c.get("roles", List.class);    // ChatGPT
        } catch (JwtException e) {
            return List.of(); // ChatGPT
        }
    }

    public String getEmail(String token) {
        try {
            Claims c = parse(token).getPayload(); // ChatGPT
            return c.get("email", String.class);  // ChatGPT
        } catch (JwtException e) {
            return null; // ChatGPT
        }
    }

    public Authentication buildAuthentication(String token) {

        Jws<Claims> jws = parse(token);
        Claims claims = jws.getPayload();

        if (!"access".equals(claims.get("type")))
            throw new JwtException("Not an access token");

        UUID userId = UUID.fromString(claims.getSubject());
        String email = claims.get("email", String.class);

        List<String> roles = claims.get("roles", List.class);

        List<SimpleGrantedAuthority> authorities =
                roles.stream()
                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                        .toList();

        UserPrincipal principal = new UserPrincipal(userId, email, authorities);

        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }
}
