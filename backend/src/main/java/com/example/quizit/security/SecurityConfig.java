package com.example.quizit.security;


import com.example.quizit.records.ApiError;
import com.example.quizit.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.View;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;



    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, View error) throws Exception {

        http.csrf(e-> e.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authorizeHttpRequest  -> authorizeHttpRequest
                        .requestMatchers(HttpMethod.POST, "/quizit/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/quizit/logout").permitAll()
                        .requestMatchers(HttpMethod.POST, "/quizit/refresh").permitAll()
                        .requestMatchers(HttpMethod.POST, "/quizit/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/quizit/participant").permitAll()
                        .requestMatchers(HttpMethod.GET, "/quizit/participants/quiz/*").permitAll()
                        .requestMatchers("/quiz-websocket/**").permitAll()
                        .requestMatchers("/quiz-websocket").permitAll()
                        .requestMatchers("/quizit/quiz-session").permitAll()
                        .requestMatchers("/quizit/quiz-session/**").permitAll()
                        .requestMatchers("/quizit/question").permitAll()
                        .requestMatchers(HttpMethod.POST,"/quizit/quiz/{quizId}/end").permitAll()
                        .anyRequest().authenticated()
                )
//                .authorizeHttpRequests(auth -> auth
//                        .anyRequest().permitAll()
//                )
                .exceptionHandling(ex->ex.authenticationEntryPoint((request, response, e) -> {
//                                    e.printStackTrace();
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType("application/json");
                    String message = "Unauthorized user! "+e.getMessage();

                    String err=(String) request.getAttribute("errException");

                    if(err!=null){
                        message = err;
                    }
                    Map<String, Object> errorMap = Map.of(
                            "message", message,
                            "status", HttpStatus.UNAUTHORIZED.name(),
                            "statusCode",401
                    );
                    ApiError apiError = ApiError.of(401,HttpStatus.UNAUTHORIZED.name(),message,request.getRequestURI());
                    var objectMapper = new ObjectMapper();
                    response.getWriter().write(objectMapper.writeValueAsString(apiError));

                }))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
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
