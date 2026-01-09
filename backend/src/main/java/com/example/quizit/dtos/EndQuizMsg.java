package com.example.quizit.dtos;

import lombok.*;

import java.util.UUID;

@Data
@Getter
@Setter
@Builder
public class EndQuizMsg {
    private UUID quizId;
}
