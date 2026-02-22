package com.example.quizit.features.otpVerification;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OtpResponseDto {

    private String message;
    private boolean verified;
}