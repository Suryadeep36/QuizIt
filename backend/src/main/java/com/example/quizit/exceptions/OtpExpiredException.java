package com.example.quizit.exceptions;

public class OtpExpiredException extends RuntimeException {
    public OtpExpiredException(String message) {
        super(message);
    }
}