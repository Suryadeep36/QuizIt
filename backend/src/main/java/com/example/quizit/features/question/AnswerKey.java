package com.example.quizit.features.question;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnswerKey {
    private String key;
    private Map<String, String> matchPairs;
}
