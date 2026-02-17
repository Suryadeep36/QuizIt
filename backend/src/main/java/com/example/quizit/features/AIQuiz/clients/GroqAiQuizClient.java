package com.example.quizit.features.AIQuiz.clients;

import com.example.quizit.features.AIQuiz.GenerateQuizResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
@RequiredArgsConstructor
public class GroqAiQuizClient implements AiQuizClient {

    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    @Override
    public GenerateQuizResponseDto generate(String prompt) {

        try {
            // 1️⃣ Call Groq
            String rawResponse = groqClient.generateQuiz(
                    AiPromptTemplate.SYSTEM_PROMPT,
                    prompt
            );

            // 2️⃣ Extract assistant content
            JsonNode root = objectMapper.readTree(rawResponse);
            String content = root
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            // 3️⃣ Convert JSON string → DTO
            GenerateQuizResponseDto quizResponse =
                    objectMapper.readValue(content, GenerateQuizResponseDto.class);

            quizResponse.setProvider("groq");
            quizResponse.setModel(root.path("model").asText());

            return quizResponse;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate quiz from Groq AI", e);
        }
    }
}
