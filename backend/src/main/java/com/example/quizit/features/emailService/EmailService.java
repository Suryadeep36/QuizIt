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
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🔒 Verify your QuizIt Account");

            // Using the colors from your React Landing Page:
            // Cyan: #0891b2 (cyan-600), Orange: #fb923c (orange-400)
            String html = """
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <table width="100%%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="center" style="padding: 40px 0;">
                                <table width="450" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                                    <tr>
                                        <td align="center" style="background: linear-gradient(135deg, #0891b2 0%%, #0e7490 100%%); padding: 40px 20px;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">QuizIt</h1>
                                            <p style="color: #cffafe; margin: 10px 0 0 0; font-size: 16px;">Secure Quiz Platform</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 40px 32px;">
                                            <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px; text-align: center;">Verify Your Email</h2>
                                            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
                                                Thanks for joining QuizIt! Use the verification code below to complete your registration. This code expires in <b>5 minutes</b>.
                                            </p>
                                            
                                            <div style="background-color: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 16px; padding: 24px; text-align: center;">
                                                <span style="display: block; font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 8px;">Your Code</span>
                                                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #fb923c; letter-spacing: 8px;">%s</span>
                                            </div>

                                            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
                                                If you didn't request this code, you can safely ignore this email.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
                                            <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                                &copy; 2026 QuizIt Inc. <br/>
                                                Empowering smarter assessments.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(otp);

            helper.setText(html, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}