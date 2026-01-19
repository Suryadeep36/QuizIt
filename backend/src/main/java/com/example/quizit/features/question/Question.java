package com.example.quizit.features.question;

import com.example.quizit.features.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "question_id")
    private UUID questionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Quiz quiz;

    @Column(columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "correct_answer", columnDefinition = "jsonb")
    private Map<String, Object> correctAnswer;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> options;


    private Integer duration;

    @Column(name = "question_type")
    private String questionType;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;

}
