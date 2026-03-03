package com.example.quizit.features.GoogleCredential;

public interface GoogleCredentialService {
    String generateAccessToken(String refreshToken);
    String fetchFormJson(String formId, String accessToken);
}
