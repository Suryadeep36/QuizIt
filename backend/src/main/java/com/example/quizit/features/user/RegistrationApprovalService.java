package com.example.quizit.features.user;

import com.example.quizit.features.emailService.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationApprovalService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.auth.frontend.base-url}")
    private String baseUrl;

    @Value("${app.auth.frontend.admin-review-path}")
    private String adminPath;

    public void notifyAdminsForTeacherSignup(UserDto teacherDto) {
        // 1. Fetch admins
        List<User> admins = userRepository.findByRoles_Name("ROLE_ADMIN");

        if (admins.isEmpty()) {
            return;
        }

        // Construct dynamic URL
        String reviewUrl = baseUrl + adminPath;
        String subject = "🔔 New Teacher Access Request: " + teacherDto.getUsername();

        // 2. Format the email with dynamic URL
        String htmlBody = """
            <div style="font-family: sans-serif; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; max-width: 600px; margin: auto;">
                <div style="background: #0891b2; padding: 25px; color: white; text-align: center;">
                    <h2 style="margin: 0; font-size: 24px;">Teacher Access Request</h2>
                </div>
                <div style="padding: 30px; color: #374151; line-height: 1.5;">
                    <p style="font-size: 16px;">Hello Admin,</p>
                    <p>A new user has requested <strong>Teacher</strong> privileges on the QuizIt platform. Details are provided below:</p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #fb923c;">
                        <p style="margin: 0 0 10px 0;"><strong>Username:</strong> %s</p>
                        <p style="margin: 0;"><strong>Email:</strong> %s</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; margin-bottom: 25px;">
                        Before this user can create quizzes, their account must be manually enabled via the management dashboard.
                    </p>
                    
                    <div style="text-align: center;">
                        <a href="%s" 
                           style="display: inline-block; background: #fb923c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                           Review & Approve Request
                        </a>
                    </div>
                </div>
                <div style="background: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">&copy; 2026 QuizIt Security System</p>
                </div>
            </div>
            """.formatted(teacherDto.getUsername(), teacherDto.getEmail(), reviewUrl);

        // 3. Send to all admins
        for (User admin : admins) {
            emailService.sendRegisterMail(admin.getEmail(), subject, htmlBody);
        }
    }
}