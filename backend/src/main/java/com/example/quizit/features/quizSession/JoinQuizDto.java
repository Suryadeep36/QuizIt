package com.example.quizit.features.quizSession;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JoinQuizDto {
    String sessionId;
    String quizId;
}
