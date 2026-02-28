package com.example.quizit.features.quiz;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    boolean existsByQuizNameAndHostId(String quizName, UUID hostId);
    Optional<Quiz> findByQuizIdAndHostId(UUID id, UUID ownerId);

    List<Quiz> findQuizByHost_Id(UUID hostId);

    boolean existsByQuizIdAndHostId(UUID quizId, UUID hostId);

    boolean existsByHostId(UUID hostId);

    @Query("""
SELECT COALESCE(SUM(q.duration), 0)
FROM Question q
WHERE q.quiz.quizId = :quizId
""")
    Integer getTotalDurationByQuizId(UUID quizId);
    }