package com.example.quizit.features.questionAnalyticsUser;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.question.Question;
import com.example.quizit.features.quiz.Quiz;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(
        name = "question_analytics_user",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"participant_id", "question_id"})
        }
)
public class QuestionAnalyticsUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "qau_id")
    private UUID qauId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "time_spent")
    private Integer timeSpent;


    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_answer", columnDefinition = "jsonb")
    private Map<String, Object> selectedAnswer;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "tab_switch_count")
    private Integer tabSwitchCount = 0;
}
