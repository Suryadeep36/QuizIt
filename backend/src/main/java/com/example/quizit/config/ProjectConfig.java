package com.example.quizit.config;


import com.example.quizit.features.questionAnalyticsQuiz.QuestionAnalyticsQuizDto;
import com.example.quizit.features.quiz.QuizDto;
import com.example.quizit.features.questionAnalyticsQuiz.QuestionAnalyticsQuiz;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.role.Role;
import com.example.quizit.features.user.User;
import com.example.quizit.features.user.UserDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import java.util.Set;
import java.util.stream.Collectors;


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
                    m.map(src -> src.getFastestParticipant().getParticipantId(), QuestionAnalyticsQuizDto::setFastestUserId);
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

        Converter<Set<Role>, Set<String>> roleToStringConverter =
                ctx -> ctx.getSource()
                        .stream()
                        .map(Role::getName)
                        .collect(Collectors.toSet());

        modelMapper.typeMap(User.class, UserDto.class)
                .addMappings(mapper ->
                        mapper.using(roleToStringConverter)
                                .map(User::getRoles, UserDto::setRoles)
                );

        return modelMapper;
    }

    @Configuration
    public class JacksonConfig {

        @Bean
        public ObjectMapper objectMapper() {
            return new ObjectMapper();
        }
    }

    @Configuration
    public class SchedulerConfig {

        @Bean
        public TaskScheduler taskScheduler() {
            return new ThreadPoolTaskScheduler();
        }
    }
}
