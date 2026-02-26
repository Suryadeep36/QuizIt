package com.example.quizit.features.examMode;

import com.example.quizit.features.question.Question;
import com.example.quizit.features.question.QuestionDto;
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

    /*
    * Attempt key = attempt:{quizId}:participant:{participantId}
    * Question map key = quiz:{quizId}:questions:{questionId}
    * Question order key = quiz:{quizId}:order:{participantId}
    * */
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String ATTEMPT_KEY_PREFIX = "attempt:";
    private static final String QUESTION_KEY_PREFIX = "quiz:";
    private static final long EXTRA_SECONDS = Duration.ofHours(2).getSeconds();

    public void setTTL(String key, long durationInSeconds){
        redisTemplate.expire(key,
                durationInSeconds + EXTRA_SECONDS,
                TimeUnit.SECONDS);
    }
    public String getAttemptKey(UUID quizId, UUID participantId){
        return ATTEMPT_KEY_PREFIX + quizId + ":participant:" + participantId;
    }

    public String getQuestionMapKey(UUID quizId, UUID questionId){
        return QUESTION_KEY_PREFIX + quizId + ":question:" + questionId;
    }

    public String getQuestionOrderKey(UUID quizId, UUID participantId){
        return QUESTION_KEY_PREFIX + quizId + ":order:" + participantId;
    }

    public String getQuestionCachedMarker(UUID quizId){
        return QUESTION_KEY_PREFIX + quizId + ":questions:cached";
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
    }

    public void cacheQuestions(UUID quizId, List<QuestionDto> questions, Duration duration) {
        String markerKey = getQuestionCachedMarker(quizId);

        Boolean firstTime = redisTemplate.opsForValue()
                .setIfAbsent(markerKey, "true");
        if (Boolean.FALSE.equals(firstTime)) {
            return;
        }
        setTTL(markerKey, duration.getSeconds());
        for (QuestionDto q : questions) {
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

    public QuestionDto getCurrentQuestion(UUID quizId, UUID participantId){

    }
    public void startAttempt(UUID quizId, UUID participantId){
        String attemptKey = getAttemptKey(quizId,participantId);
        Map <Object, Object> attempt = redisTemplate.opsForHash().entries(attemptKey);
        String status = (String) attempt.get("status");
//        if ("ACTIVE".equals(status)) {
//            return getCurrentQuestion(quizId, participantId);
//        }

        if (!"READY".equals(status)) {
            throw new IllegalStateException("Invalid state");
        }
        long now = System.currentTimeMillis();
        redisTemplate.opsForHash().put(attemptKey, "status", "ACTIVE");
        redisTemplate.opsForHash().put(attemptKey, "startTime", String.valueOf(now));
        redisTemplate.opsForHash().put(attemptKey, "lastTick", String.valueOf(now));
        redisTemplate.opsForHash().put(attemptKey, "currentIndex", "0");

    }
}
