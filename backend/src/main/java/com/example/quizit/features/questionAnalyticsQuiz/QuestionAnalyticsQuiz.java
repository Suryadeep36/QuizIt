package com.example.quizit.features.questionAnalyticsQuiz;

import com.example.quizit.features.participant.Participant;
import com.example.quizit.features.quiz.Quiz;
import com.example.quizit.features.question.Question;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "question_analytics_quiz")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuestionAnalyticsQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "qaq_id")
    private UUID qaqId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "quiz_id",
            referencedColumnName = "quiz_id",
            nullable = false
    )
    private Quiz quiz;

    @OneToOne
    private Question question;

    @Column(name = "total_answered")
    private Integer totalAnswered;

    @Column(name = "correct_answer_count")
    private Integer correctAnswerCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "fastest_participant_id",
            referencedColumnName = "participant_id"
    )
    private Participant fastestParticipant;

    @Column(name = "average_time")
    private long averageTime;
}