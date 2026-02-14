package com.example.quizit.security;

import com.example.quizit.features.role.Role;
import com.example.quizit.features.role.RoleRepository;
import com.example.quizit.features.user.Provider;
import com.example.quizit.features.user.User;
import com.example.quizit.features.user.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RequiredArgsConstructor
@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.auth.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${app.auth.frontend.success-path}")
    private String successPath;

    private final RefreshTokenRepository refreshTokenRepository;
    private final RoleRepository roleRepository;
    Logger logger = LoggerFactory.getLogger(OAuth2SuccessHandler.class);

    private final UserRepository userRepository;
    private final JwtService  jwtService;
    private final CookieService cookieService;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
         logger.info(authentication.toString());

        OAuth2User authUser = (OAuth2User) authentication.getPrincipal();

        User user;

        String regisrationId= "unknown";
        if(authentication instanceof OAuth2AuthenticationToken token)
        {
            regisrationId = token.getAuthorizedClientRegistrationId();
        }
        switch (regisrationId)
        {
            case "google":
                String googleId = authUser.getAttributes().getOrDefault("sub","").toString();
                String name = authUser.getAttributes().getOrDefault("name","").toString();
                String email = authUser.getAttributes().getOrDefault("email","").toString();
                String picture =  authUser.getAttributes().getOrDefault("picture","").toString();




                Role role = roleRepository.findByName("ROLE_" + AppConstraint.USER_ROLE)
                        .orElseThrow(() -> new RuntimeException("USER role not found"));

                Set<Role> defaultRoles = Set.of(role);

                user = userRepository.findByEmail(email)
                        .orElseGet(() ->
                                userRepository.save(
                                        //userOb
                                        User.builder()
                                                .email(email)
                                                .image(picture)
                                                .provider(Provider.GOOGLE)
                                                .username(name)
                                                .roles(defaultRoles)
                                                .enable(true)
                                                .build()
                                )
                        );


                String jti  = UUID.randomUUID().toString();
                RefreshToken refreshTokenOb = RefreshToken.builder()
                        .jti(jti)
                        .user(user)
                        .revoked(false)
                        .createdAt(Instant.now())
                        .expiresAt(Instant.now().plusSeconds(jwtService.getRefreshTokenValiditySeconds()))
                        .build();

                String accessToken= jwtService.generateAccessToken(user);
                String refreshToken = jwtService.generateRefreshToken(user,refreshTokenOb.getJti());
                refreshTokenRepository.save(refreshTokenOb);
                cookieService.attachRefreshCookie(response,refreshToken,(int) jwtService.getRefreshTokenValiditySeconds());

                break;

                 case "unknown":
                     throw new RuntimeException("Unknown provider!");

        }


        String redirectUrl = frontendBaseUrl + successPath;
        response.sendRedirect(redirectUrl);


    }
}
