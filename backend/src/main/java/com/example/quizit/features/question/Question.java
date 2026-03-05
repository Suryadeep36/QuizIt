package com.example.quizit.features.question;

import com.example.quizit.features.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
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
    private List<AnswerKey> correctAnswer;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> options;

    private Integer duration;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type")
    private QuestionType questionType;

    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;


    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "case_sensitive")
    private Boolean caseSensitive;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "acceptable_answers", columnDefinition = "jsonb")
    private List<String> acceptableAnswers;

    @Column(name = "max_answer_length")
    private Integer maxAnswerLength;

    @Column(name = "allow_multiple_answers")
    private Boolean allowMultipleAnswers;

    @Column(name = "is_ai_generated")
    private Boolean isAIGenerated;

    @Column(name = "display_order", nullable = true)
    private Integer displayOrder;

    @Column(name = "points", nullable = false)
    private Integer points = 0;

}
