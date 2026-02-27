package com.example.quizit.features.examMode;

import com.example.quizit.features.question.QuestionForUserDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ExamRedisService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String ATTEMPT_KEY_PREFIX = "attempt:";
    private static final String QUIZ_KEY_PREFIX = "quiz:";
    private static final long EXTRA_SECONDS = Duration.ofHours(2).getSeconds();

    public void setTTL(String key, long durationInSeconds) {
        redisTemplate.expire(key,
                durationInSeconds + EXTRA_SECONDS,
                TimeUnit.SECONDS);
    }

    public String getAttemptKey(UUID quizId, UUID participantId) {
        return ATTEMPT_KEY_PREFIX + quizId + ":participant:" + participantId;
    }

    public String getQuestionMapKey(UUID quizId, UUID questionId) {
        return QUIZ_KEY_PREFIX + quizId + ":question:" + questionId;
    }

    public String getQuestionOrderKey(UUID quizId, UUID participantId) {
        return QUIZ_KEY_PREFIX + quizId + ":order:" + participantId;
    }

    public String getQuestionCachedMarker(UUID quizId) {
        return QUIZ_KEY_PREFIX + quizId + ":questions:cached";
    }

    public String getAnswerKey(UUID quizId, UUID participantId) {
        return ATTEMPT_KEY_PREFIX + quizId + ":participant:" + participantId + ":answers";
    }

    public void initializeAttempt(UUID quizId,
                                  UUID participantId,
                                  Duration duration) {

        String key = getAttemptKey(quizId, participantId);
        String lockKey = key + ":lock";

        Boolean firstTime = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "1");

        if (Boolean.FALSE.equals(firstTime)) {
            return;
        }

        setTTL(lockKey, duration.getSeconds());

        Map<String, String> fields = new HashMap<>();
        fields.put("status", "READY");
        fields.put("lastTick", String.valueOf(System.currentTimeMillis()));

        redisTemplate.opsForHash().putAll(key, fields);
        setTTL(key, duration.getSeconds());
        String answerKey = getAnswerKey(quizId, participantId);
        redisTemplate.expire(answerKey,
                duration.getSeconds() + EXTRA_SECONDS,
                TimeUnit.SECONDS);
    }

    public void cacheQuestions(UUID quizId, List<QuestionForUserDto> questions, Duration duration) {
        String markerKey = getQuestionCachedMarker(quizId);

        Boolean firstTime = redisTemplate.opsForValue()
                .setIfAbsent(markerKey, "true");
        if (Boolean.FALSE.equals(firstTime)) {
            return;
        }
        setTTL(markerKey, duration.getSeconds());
        for (QuestionForUserDto q : questions) {
            String key = getQuestionMapKey(quizId, q.getQuestionId());
            try {
                String value = objectMapper.writeValueAsString(q);
                redisTemplate.opsForValue().set(key, value);
                setTTL(key, duration.getSeconds());
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize question", e);
            }
        }
    }


    public void storeShuffledOrderIfAbsent(
            UUID quizId,
            UUID participantId,
            List<UUID> questionIds, Duration duration) {

        String key = getQuestionOrderKey(quizId, participantId);

        Boolean firstTime = redisTemplate.opsForValue()
                .setIfAbsent(key + ":lock", "1");

        if (Boolean.FALSE.equals(firstTime)) {
            return;
        }

        Collections.shuffle(questionIds);

        List<String> ids = questionIds.stream()
                .map(UUID::toString)
                .toList();

        redisTemplate.opsForList().rightPushAll(key, ids);
        setTTL(key, duration.getSeconds());
    }

    public List<UUID> getShuffledOrderQuestionList(UUID quizId, UUID participantId) {
        String key = getQuestionOrderKey(quizId, participantId);
        List<String> ids = redisTemplate.opsForList().range(key, 0, -1);

        if (ids == null || ids.isEmpty()) {
            throw new IllegalStateException("Shuffled order not found for this participant.");
        }

        return ids.stream()
                .map(UUID::fromString)
                .toList();
    }

    public QuestionForUserDto getQuestionFromIndex(UUID quizId, UUID participantId, int newIndex) {
        String orderKey = getQuestionOrderKey(quizId, participantId);

        String questionIdStr = redisTemplate.opsForList()
                .index(orderKey, newIndex);

        if (questionIdStr == null) {
            throw new IllegalStateException("Invalid question index");
        }

        UUID questionId = UUID.fromString(questionIdStr);

        String questionKey = getQuestionMapKey(quizId, questionId);

        String jsonString = redisTemplate.opsForValue().get(questionKey);

        if (jsonString == null) {
            throw new IllegalStateException("Question not found in cache");
        }
        try {
            return objectMapper.readValue(jsonString, QuestionForUserDto.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize question", e);
        }
    }

    public int getCurrentIndex(UUID quizId, UUID participantId) {
        String attemptKey = getAttemptKey(quizId, participantId);

        Map<Object, Object> attempt =
                redisTemplate.opsForHash().entries(attemptKey);

        if (attempt == null || attempt.isEmpty()) {
            throw new IllegalStateException("Attempt not initialized");
        }

        String status = (String) attempt.get("status");
        if (!"ACTIVE".equals(status)) {
            throw new IllegalStateException("Quiz not active");
        }

        String indexStr = (String) attempt.get("currentIndex");
        if (indexStr == null) {
            throw new IllegalStateException("Current index missing");
        }
        return Integer.parseInt(indexStr);
    }

    public QuestionForUserDto getCurrentQuestion(UUID quizId, UUID participantId) {
        int currentIndex = getCurrentIndex(quizId, participantId);
        return getQuestionFromIndex(quizId, participantId, currentIndex);
    }

    public QuestionForUserDto startAttempt(UUID quizId, UUID participantId, Duration duration) {
        String attemptKey = getAttemptKey(quizId, participantId);
        Map<Object, Object> attempt = redisTemplate.opsForHash().entries(attemptKey);
        String status = (String) attempt.get("status");
        if ("ACTIVE".equals(status)) {
            return getCurrentQuestion(quizId, participantId);
        }

        if (!"READY".equals(status)) {
            throw new IllegalStateException("Invalid state");
        }
        long now = System.currentTimeMillis();
        //change endTime to dynamic duration
        long endTime = System.currentTimeMillis() + duration.toMillis();
        redisTemplate.opsForHash().put(attemptKey, "status", "ACTIVE");
        redisTemplate.opsForHash().put(attemptKey, "startTime", String.valueOf(now));
        redisTemplate.opsForHash().put(attemptKey, "lastTick", String.valueOf(now));
        redisTemplate.opsForHash().put(attemptKey, "currentIndex", "0");
        redisTemplate.opsForHash().put(attemptKey ,"endTime", String.valueOf(endTime));
        return getCurrentQuestion(quizId, participantId);
    }

    public QuestionForUserDto switchQuestion(UUID quizId,
                                             UUID participantId, int newIndex) {

        //don't show question once duration is over
        String attemptKey = getAttemptKey(quizId, participantId);
        long now = System.currentTimeMillis();

        Map<Object, Object> attempt =
                redisTemplate.opsForHash().entries(attemptKey);
        if (!"ACTIVE".equals(attempt.get("status"))) {
            throw new IllegalStateException("Quiz not active");
        }
        int currentIndex = Integer.parseInt((String) attempt.get("currentIndex"));
        long lastTick = Long.parseLong((String) attempt.get("lastTick"));

        String orderKey = getQuestionOrderKey(quizId, participantId);
        String currentQuestionId = redisTemplate.opsForList().index(orderKey, currentIndex);
        long delta = now - lastTick;
        redisTemplate.opsForHash().increment(attemptKey, "q:" + currentQuestionId + ":time", delta);
        redisTemplate.opsForHash().put(attemptKey, "currentIndex", String.valueOf(newIndex));
        redisTemplate.opsForHash().put(attemptKey, "lastTick", String.valueOf(now));
        return getCurrentQuestion(quizId, participantId);
    }

    public void submitAnswer(UUID quizId,
                             UUID participantId,
                             Map<String, Object> selectedOption) {

        String attemptKey = getAttemptKey(quizId, participantId);

        Map<Object, Object> attempt =
                redisTemplate.opsForHash().entries(attemptKey);

        if (attempt == null || attempt.isEmpty()) {
            throw new IllegalStateException("Attempt not initialized");
        }

        if (!"ACTIVE".equals(attempt.get("status"))) {
            throw new IllegalStateException("Quiz not active");
        }

        long now = System.currentTimeMillis();

        int currentIndex = Integer.parseInt((String) attempt.get("currentIndex"));
        String orderKey = getQuestionOrderKey(quizId, participantId);

        String questionId = redisTemplate.opsForList()
                .index(orderKey, currentIndex);

        if (questionId == null) {
            throw new IllegalStateException("Invalid question index");
        }

        String answerKey = getAnswerKey(quizId, participantId);

        try {
            String answerJson = objectMapper.writeValueAsString(selectedOption);
            long lastTick = Long.parseLong(
                    redisTemplate.opsForHash()
                            .get(attemptKey, "lastTick")
                            .toString()
            );

            long delta = now - lastTick;
            String timeField = "q:" + questionId + ":time";

            Object currentObj = redisTemplate.opsForHash()
                    .get(attemptKey, timeField);

            long currentTime = currentObj == null
                    ? 0
                    : Long.parseLong(currentObj.toString());

            QuestionForUserDto question = getCurrentQuestion(quizId, participantId);
            long maxMillis = question.getDuration() * 1000L;
            long newTime = currentTime + delta;

            if (newTime > maxMillis) {
                throw new IllegalStateException("Question time exceeded. Submission rejected.");
            }
            redisTemplate.opsForHash()
                    .increment(attemptKey, timeField, delta);
            redisTemplate.opsForHash()
                    .put(answerKey, questionId, answerJson);
            redisTemplate.opsForHash()
                    .put(attemptKey, "lastTick", String.valueOf(now));

        } catch (Exception e) {
            throw new RuntimeException("Failed to save answer", e);
        }
    }

    public ExamNavigationResponse buildNavigationResponse(UUID quizId, UUID participantId, QuestionForUserDto question) {
        String attemptKey = getAttemptKey(quizId, participantId);
        String answerKey = getAnswerKey(quizId, participantId);
        Map<Object, Object> attemptData = redisTemplate.opsForHash().entries(attemptKey);

        long now = System.currentTimeMillis();
        long lastTick = Long.parseLong((String) attemptData.get("lastTick"));
        long endTime = Long.parseLong((String) attemptData.get("endTime"));
        long globalRemainingTime = Math.max(0, endTime - now);

        String timeField = "q:" + question.getQuestionId() + ":time";
        Object timeSpentObj = attemptData.get(timeField);
        long timeSpent = (timeSpentObj == null) ? 0 : Long.parseLong(timeSpentObj.toString());

        long currentWindowDelta = now - lastTick;
        long totalQuestionTimeSpent = timeSpent + currentWindowDelta;
        long questionRemainingTime = Math.max(0, (question.getDuration() * 1000L) - totalQuestionTimeSpent);

        Object savedAnswerJson = redisTemplate.opsForHash().get(answerKey, question.getQuestionId().toString());
        Map<String, Object> selectedAnswer = null;

        if (savedAnswerJson != null) {
            try {
                selectedAnswer = objectMapper.readValue(savedAnswerJson.toString(), new TypeReference<>() {});
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
        }

        return ExamNavigationResponse.builder()
                .question(question)
                .currentIndex(Integer.parseInt((String) attemptData.get("currentIndex")))
                .remainingTimeMillis(questionRemainingTime)
                .globalRemainingTimeMillis(globalRemainingTime)
                .selectedAnswer(selectedAnswer)
                .status((String) attemptData.get("status"))
                .build();
    }
    public int getTotalQuestions(UUID quizId, UUID participantId) {
        String orderKey = getQuestionOrderKey(quizId, participantId);
        Long size = redisTemplate.opsForList().size(orderKey);
        return size != null ? size.intValue() : 0;
    }
}
