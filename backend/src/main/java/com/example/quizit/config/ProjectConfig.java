package com.example.quizit.config;


import com.example.quizit.features.questionAnalyticsQuiz.QuestionAnalyticsQuizDto;
import com.example.quizit.features.quiz.QuizDto;
import com.example.quizit.features.questionAnalyticsQuiz.QuestionAnalyticsQuiz;
import com.example.quizit.features.quiz.Quiz;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


//@Configuration
//public class ProjectConfig {
//
//    @Bean
//    public ModelMapper modelMapper() {
//        return new ModelMapper();
//    }
//}


@Configuration
public class ProjectConfig {
    final ModelMapper modelMapper = new ModelMapper();
    @Bean
    public ModelMapper modelMapper() {
//        modelMapper.getConfiguration()
//                .setMatchingStrategy(MatchingStrategies.STRICT);
        modelMapper.typeMap(QuestionAnalyticsQuiz.class, QuestionAnalyticsQuizDto.class)
                .addMappings(m -> {
                    m.map(src -> src.getQuiz().getQuizId(), QuestionAnalyticsQuizDto::setQuizId);
                    m.map(src -> src.getQuestion().getQuestionId(), QuestionAnalyticsQuizDto::setQuestionId);
                    m.map(src -> src.getFastestUser().getId(), QuestionAnalyticsQuizDto::setFastestUserId);
                });
        modelMapper.typeMap(Quiz.class, QuizDto.class)
                .addMappings(m ->
                        m.map(src -> src.getHost().getId(), QuizDto::setHost)
                );
//        modelMapper.typeMap(QuizAnalytics.class, QuizAnalyticsDto.class)
//                .addMappings(m -> {
//                    m.skip(QuizAnalyticsDto::setQuizId);
//                    m.map(src -> src.getQuiz().getQuizId(),
//                            QuizAnalyticsDto::setQuizId);
//
//                    m.map(src -> src.getWinnerUser().getId(),
//                            QuizAnalyticsDto::setWinnerUserId);
//                });
        return modelMapper;
    }
}
