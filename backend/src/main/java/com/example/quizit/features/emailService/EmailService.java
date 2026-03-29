package com.example.quizit.features.emailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendOtp(String toEmail, String otp) {
        int maxAttempts = 3;
        int attempt = 0;

        while (attempt < maxAttempts) {
            try {
                attempt++;

                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                helper.setTo(toEmail);
                helper.setSubject("🔒 Verify your QuizIt Account");

                String html = "..."; // your same HTML
                helper.setText(html.formatted(otp), true);

                mailSender.send(message);

                return; // ✅ success → exit method

            } catch (Exception e) {
                System.out.println("Attempt " + attempt + " failed");

                if (attempt == maxAttempts) {
                    throw new RuntimeException("Failed after 3 attempts", e);
                }

                try {
                    Thread.sleep(2000); // wait 2 sec before retry
                } catch (InterruptedException ignored) {}
            }
        }
    }

    @Async
    public CompletableFuture<Void> sendRegisterMail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);

            return CompletableFuture.completedFuture(null);

        } catch (Exception e) {
            return CompletableFuture.failedFuture(e);
        }
    }
}