package com.example.quizit.features.questionAnalyticsUser;

import java.util.List;

public interface QuestionAnalyticsUserService {

     QuestionAnalyticsUserDto createQuestionAnalyticsUser(QuestionAnalyticsUserDto questionAnalyticsUserDto);
     List<QuestionAnalyticsUserDto> getQuestionAnalyticsUsersByParticipantId(String participantId);
     QuestionAnalyticsUserDto getQuestionAnalyticsUserById(String questionAnalyticsUserId);
    QuestionAnalyticsUserDto getQuestionAnalyticsUserById(String participantId, String questionID);

     QuestionAnalyticsUserDto updateQuestionAnalyticsUser(String uuid,QuestionAnalyticsUserDto questionAnalyticsUserDto);
     QuestionAnalyticsUserDto updateQuestionAnalyticsUser(String participantId,String questionId,QuestionAnalyticsUserDto questionAnalyticsUserDto);
     void deleteQuestionAnalyticsUser(String questionAnalyticsUserId);
}
