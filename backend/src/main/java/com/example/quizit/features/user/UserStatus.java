package com.example.quizit.features.user;

public enum UserStatus {
    TEACHER_PENDING,    // User verified email but waiting for Admin (for Teachers)
    TEACHER_APPROVED,   // Admin allowed access
    TEACHER_REJECTED,   // Admin denied access
    TEACHER_ACTIVE,
    ADMIN_APPROVED,// Standard status for Users/Students after OTP
    ADMIN_REJECTED,
}