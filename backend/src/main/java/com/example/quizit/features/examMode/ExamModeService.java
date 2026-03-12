package com.example.quizit.features.examMode;

import java.util.Map;
import java.util.UUID;

public interface ExamModeService {
    public PreRegisterResponse preRegisterParticipant(PreRegisterUserDto preRegisterUserDto, UUID userId, String userAgent, String ipAddress);
    public ExamNavigationResponse startExam(UUID quizId, UUID participantId);
    public ExamNavigationResponse switchQuestion(UUID quizId, UUID participantId, int targetIndex, int tabSwitches);
    public void submitAnswer(UUID quizId, UUID participantId, Map<String, Object>  selectedAnswer);
    public void submitExam(UUID quizId, UUID participantId);
}
