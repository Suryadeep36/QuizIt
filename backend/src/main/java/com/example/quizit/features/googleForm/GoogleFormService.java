package com.example.quizit.features.googleForm;

import com.example.quizit.features.GoogleCredential.EncryptionService;
import com.example.quizit.features.GoogleCredential.GoogleCredential;
import com.example.quizit.features.GoogleCredential.GoogleCredentialRepository;
import com.example.quizit.features.GoogleCredential.GoogleCredentialService;
import com.example.quizit.features.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleFormService {

    private final EncryptionService encryptionService;
    private final GoogleCredentialRepository googleCredentialRepository;
    private final GoogleCredentialService googleCredentialService;

    public String extractFormId(String url) {
        String[] parts = url.split("/");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].equals("d") || parts[i].equals("e")) {
                return parts[i + 1];
            }
        }
        throw new RuntimeException("Invalid Google Form URL");
    }

    public String importForm(String formUrl, User user) {

        String formId = extractFormId(formUrl);

        GoogleCredential credential = googleCredentialRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Google account not linked"));
        String decryptedRefreshToken = encryptionService.decrypt(credential.getRefreshToken());

        String accessToken = googleCredentialService.generateAccessToken(decryptedRefreshToken);
        String formJson = googleCredentialService.fetchFormJson(formId, accessToken);

        System.out.println(formJson); // temporary


        // 5. Parse questions
        // 6. Save Quiz + Questions in DB

        return formJson; // temporary
    }

}