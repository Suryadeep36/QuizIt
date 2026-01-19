package com.example.quizit.features.quiz;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    boolean existsByQuizNameAndHostId(String quizName, UUID hostId);

    List<Quiz> findQuizByHost_Id(UUID hostId);
}