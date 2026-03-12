package com.example.quizit.security;


import com.example.quizit.records.ApiError;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.View;
import tools.jackson.databind.ObjectMapper;




@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    @Autowired
    private AuthenticationSuccessHandler successHandler;
    @Autowired
    private OAuth2SuccessHandler oAuth2SuccessHandler;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, View error) throws Exception {

        http.csrf(e -> e.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authorizeHttpRequest -> authorizeHttpRequest
                        .requestMatchers(AppConstraint.AUTH_PUBLIC_URLS).permitAll()
                        .requestMatchers(AppConstraint.QUIZIT_PUBLIC_URLS).permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/quizit/health").permitAll()
                        //CHECKING PURPOSE, ALSO CHECK AT @GetMapping("/quiz/host/{hostId}") TO SEE EXAMPLE OF PreAuthorize
                        //.requestMatchers("/quizit/quiz/host/{hostId}").hasRole(AppConstraint.ADMIN_ROLE)
                        .requestMatchers("/quizit/users").hasRole(AppConstraint.ADMIN_ROLE)
                        .anyRequest().authenticated()
                )

//                .authorizeHttpRequests(auth -> auth
//                        .anyRequest().permitAll()
//                )

                //Google Login
                .oauth2Login(oauth2 ->
                        oauth2
                                .authorizationEndpoint(endpoint ->
                                        endpoint.authorizationRequestResolver(
                                                authorizationRequestResolver(
                                                        http.getSharedObject(ClientRegistrationRepository.class)
                                                )
                                        )
                                )
                                .successHandler(oAuth2SuccessHandler)
                )


                .logout(AbstractHttpConfigurer::disable)

                .exceptionHandling(ex ->
                                ex.authenticationEntryPoint((request, response, e) -> {
//                                    e.printStackTrace();
                                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                                    response.setContentType("application/json");
                                    String message = "Unauthorized user! " + e.getMessage();

                                    String err = (String) request.getAttribute("errException");

                                    if (err != null) {
                                        message = err;
                                    }

                                    ApiError apiError = ApiError.of(401, HttpStatus.UNAUTHORIZED.name(), message, request.getRequestURI());
                                    var objectMapper = new ObjectMapper();
                                    response.getWriter().write(objectMapper.writeValueAsString(apiError));

                                }).accessDeniedHandler((request, response, e) -> {
                                    response.setStatus(HttpStatus.FORBIDDEN.value());
                                    response.setContentType("application/json");

                                    String message = "Forbidden user! " + e.getMessage();
                                    String err = (String) request.getAttribute("errException");
                                    if (err != null) {
                                        message = err;
                                    }

                                    ApiError apiError = ApiError.of(403, HttpStatus.FORBIDDEN.name(), message, request.getRequestURI());
                                    var objectMapper = new ObjectMapper();
                                    response.getWriter().write(objectMapper.writeValueAsString(apiError));
                                })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public OAuth2AuthorizationRequestResolver authorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {

        DefaultOAuth2AuthorizationRequestResolver resolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository,
                        "/oauth2/authorization"
                );

        resolver.setAuthorizationRequestCustomizer(builder ->
                builder.additionalParameters(params -> {
                    params.put("access_type", "offline");
                    params.put("prompt", "consent");
                })
        );

        return resolver;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }


//    @Bean
//    public UserDetailsService users(){
//        User.UserBuilder userBuilder = User.withDefaultPasswordEncoder();
//        UserDetails user1 = userBuilder.username("kp").password("kp123").roles("ADMIN").build();
//        UserDetails user2 = userBuilder.username("jk").password("jk123").roles("USER").build();
//        return new InMemoryUserDetailsManager(user1,user2);
//    }


}
