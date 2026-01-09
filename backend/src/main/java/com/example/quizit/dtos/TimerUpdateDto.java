package com.example.quizit.dtos;

import lombok.*;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
@Setter
public class TimerUpdateDto {
    int remainingSeconds;
}
