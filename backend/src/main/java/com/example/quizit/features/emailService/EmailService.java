package com.example.quizit.features.emailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendOtp(String toEmail, String otp) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("QuizIt OTP Verification");

            String html = """
                    <div style="font-family: Arial, sans-serif;">
                        <h2>Welcome to QuizIt</h2>
                        <p>Your OTP for account verification is:</p>
                        <h1 style="color: #4CAF50;">%s</h1>
                        <p>This OTP will expire in 5 minutes.</p>
                        <br/>
                        <p>– QuizIt Team</p>
                    </div>
                    """.formatted(otp);

            helper.setText(html, true);

            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}