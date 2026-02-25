package com.example.quizit.features.examMode;

import java.util.UUID;

public interface ExamModeService {
    public PreRegisterResponse preRegisterParticipant(PreRegisterUserDto preRegisterUserDto, UUID userId);
}
