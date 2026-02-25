package com.example.quizit.security;

import org.springframework.stereotype.Component;

//@Component
public class AppConstraint {


    public static final String[] AUTH_PUBLIC_URLS= {
            "/quizit/login/**",
            "/quizit/logout",
            "/login/**",
            "/quizit/refresh",
            "/quizit/register",
            "/quizit/verify-otp"
    };

    public static final String[] QUIZIT_PUBLIC_URLS= {
            "/quizit/participant",
            "/quizit/participants/quiz/*",
            "/quizit/question-analytics-user",
            "/quizit/question-analytics-user/participant/**",
            "/quizit/questions/{quizid}",
            "/quizit/quiz-session/{joincode}",
            "/quizit/participant/{pid}/user/{uid}",
            "/quiz-websocket/**",
            "/quiz-websocket",
            "/quizit/quiz-session",
            "/quizit/quiz-session/**",
            "/quizit/question",
            "/quizit/quiz/{quizId}/end"
    };



    public static final String ADMIN_ROLE= "ADMIN";
    public static final String USER_ROLE= "USER";



}
