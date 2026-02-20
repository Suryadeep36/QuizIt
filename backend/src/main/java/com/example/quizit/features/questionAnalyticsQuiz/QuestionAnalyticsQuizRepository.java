package com.example.quizit.features.questionAnalyticsQuiz;

import com.example.quizit.features.participant.Participant;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionAnalyticsQuizRepository extends JpaRepository<QuestionAnalyticsQuiz, UUID> {
    boolean existsByQuestion_QuestionId(UUID questionId);
    Optional<QuestionAnalyticsQuiz> getQuestionAnalyticsQuizByQuestion_QuestionId(UUID questionId);
    Optional<QuestionAnalyticsQuiz> getQuestionAnalyticsQuizByQuiz_QuizId(UUID quizQuizId);

    List<QuestionAnalyticsQuiz>
    findAllByQuiz_QuizId(UUID quizId);

//    @Modifying
//    @Query("""
//       UPDATE QuestionAnalyticsQuiz qaq
//       SET qaq.totalAnswered = COALESCE(qaq.totalAnswered, 0) + 1
//       WHERE qaq.question.questionId = :questionId
//       """)
//    int incrementTotalAnswerByQuestionId(@Param("questionId") UUID questionId);

    @Query("""
       SELECT qaq.question.questionId
       FROM QuestionAnalyticsQuiz qaq
       WHERE qaq.question.questionId IN :questionIds
       """)
    List<UUID> findExistingQuestionIds(@Param("questionIds") List<UUID> questionIds);


    @Query("""
       SELECT COUNT(qau)
       FROM QuestionAnalyticsUser qau
       WHERE qau.quiz.quizId = :quizId
       AND qau.question.questionId = :questionId
       """)
    Integer countTotalAnswered(UUID quizId, UUID questionId);

    @Query("""
       SELECT COUNT(qau)
       FROM QuestionAnalyticsUser qau
       WHERE qau.quiz.quizId = :quizId
       AND qau.question.questionId = :questionId
       AND qau.isCorrect = true
       """)
    Integer countCorrectAnswers(UUID quizId, UUID questionId);

    @Query("""
       SELECT COALESCE(AVG(qau.timeSpent),0)
       FROM QuestionAnalyticsUser qau
       WHERE qau.quiz.quizId = :quizId
       AND qau.question.questionId = :questionId
       """)
    Long calculateAverageTime(UUID quizId, UUID questionId);

    @Query("""
       SELECT qau.participant
       FROM QuestionAnalyticsUser qau
       WHERE qau.quiz.quizId = :quizId
       AND qau.question.questionId = :questionId
       AND qau.isCorrect = true
       ORDER BY qau.timeSpent ASC
       """)
    List<Participant> findFastestParticipant(UUID quizId, UUID questionId, PageRequest pageable);

    Optional<QuestionAnalyticsQuiz> findByQuestion_QuestionId(UUID questionId);
}
