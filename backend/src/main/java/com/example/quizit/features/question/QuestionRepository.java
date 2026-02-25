package com.example.quizit.features.question;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;


public interface QuestionRepository extends JpaRepository<Question, UUID> {

     Question save(Question question);
     long countQuestionByQuiz_QuizId(UUID quizQuizId);
    List<Question> findByQuiz_QuizId(UUID quizQuizId);

    @Query("select max(q.displayOrder) from Question as q where q.quiz.quizId = :quizQuizId")
    Integer findMaxDisplayOrderByQuizId(UUID quizQuizId);

    List<Question> findByQuiz_QuizIdOrderByQuestionId(UUID quizQuizId);

    List<Question> findByQuiz_QuizIdOrderByDisplayOrder(UUID quizQuizId);

    @Modifying
    @Transactional
    @Query(value = """
    WITH ordered AS (
        SELECT question_id,
               ROW_NUMBER() OVER (
                   PARTITION BY quiz_quiz_id
                   ORDER BY question_id
               ) * 10 AS new_order
        FROM question
        WHERE quiz_quiz_id = :quizId
    )
    UPDATE question q
    SET display_order = ordered.new_order
    FROM ordered
    WHERE q.question_id = ordered.question_id
    """, nativeQuery = true)
    void fixDisplayOrderForQuiz(@Param("quizId") UUID quizId);
}
