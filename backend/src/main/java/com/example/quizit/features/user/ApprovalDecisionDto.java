package com.example.quizit.features.user;

import lombok.Data;

@Data
public class ApprovalDecisionDto {
    private boolean approved; // true to allow, false to reject
    private String reason = "By Admin";    // Optional: why the admin rejected the request
}