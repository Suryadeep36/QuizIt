package com.example.quizit.features.examMode;

import com.example.quizit.features.question.QuestionForUserDto;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUserDto;
import com.example.quizit.features.questionAnalyticsUser.QuestionAnalyticsUserService;
import com.example.quizit.features.quiz.QuizService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class ExamRedisService {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final QuestionAnalyticsUserService analyticsUserService;
    private final QuizService quizService;
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

    public String getQuizDurationKey(UUID quizId) {
        return QUIZ_KEY_PREFIX + quizId + ":duration";
    }

    public String getTotalParticipantsKey(UUID quizId) {
        return QUIZ_KEY_PREFIX + quizId + ":participants:total";
    }

    public String getSubmittedParticipantsKey(UUID quizId) {
        return QUIZ_KEY_PREFIX + quizId + ":participants:submitted";
    }

    public void getOrInitializeParticipantCount(UUID quizId, Supplier<Long> dbCountSupplier, Duration duration) {

        String key = getTotalParticipantsKey(quizId);

        String existing = redisTemplate.opsForValue().get(key);
        if (existing != null) {
            return;
        }

        synchronized (this) {
            existing = redisTemplate.opsForValue().get(key);
            if (existing != null) {
                return;
            }

            long count = dbCountSupplier.get();
            System.out.println("Total participants saved " + count);
            redisTemplate.opsForValue().set(key, String.valueOf(count));
            setTTL(key, duration.getSeconds());

            String submittedKey = getSubmittedParticipantsKey(quizId);
            redisTemplate.opsForValue().setIfAbsent(submittedKey, "0");
            setTTL(submittedKey, duration.getSeconds());

        }
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
        setTTL(answerKey, duration.getSeconds());
    }

    public void recordTabSwitch(UUID quizId,
                                UUID participantId,
                                UUID questionId,
                                int tabSwitchCount) {
        String attemptKey = getAttemptKey(quizId, participantId);

        Object status = redisTemplate.opsForHash().get(attemptKey, "status");

        if (!"ACTIVE".equals(status)) {
            throw new IllegalStateException("Quiz not active");
        }

        String tabField = "q:" + questionId + ":tabs";

        redisTemplate.opsForHash()
                .put(attemptKey, tabField, String.valueOf(tabSwitchCount));
    }

    public void cacheQuestions(UUID quizId, List<QuestionForUserDto> questions, Duration duration) {
        String markerKey = getQuestionCachedMarker(quizId);

        Boolean firstTime = redisTemplate.opsForValue()
                .setIfAbsent(markerKey, "true");
        if (Boolean.FALSE.equals(firstTime)) {
            return;
        }
        setTTL(markerKey, duration.getSeconds());
        String quizDurationKey = getQuizDurationKey(quizId);
        long totalDuration = 0;
        for (QuestionForUserDto q : questions) {
            String key = getQuestionMapKey(quizId, q.getQuestionId());
            totalDuration += q.getDuration();
            try {
                String value = objectMapper.writeValueAsString(q);
                redisTemplate.opsForValue().set(key, value);
                setTTL(key, duration.getSeconds());
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize question", e);
            }
        }
        redisTemplate.opsForValue().set(quizDurationKey, String.valueOf(totalDuration));
        setTTL(quizDurationKey, duration.getSeconds());
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
        System.out.println(ids);

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
        String quizDurationKey = getQuizDurationKey(quizId);
        String totalDurationStr = redisTemplate.opsForValue().get(quizDurationKey);
        if (totalDurationStr == null) {
            throw new IllegalStateException(
                    "Total duration not cached for quiz " + quizId
            );
        }
        long totalDuration = Long.parseLong(totalDurationStr);
        long endTime = now + totalDuration * 1000L;
        redisTemplate.opsForHash().put(attemptKey, "status", "ACTIVE");
        redisTemplate.opsForHash().put(attemptKey, "startTime", String.valueOf(now));
        redisTemplate.opsForHash().put(attemptKey, "lastTick", String.valueOf(now));
        redisTemplate.opsForHash().put(attemptKey, "currentIndex", "0");
        redisTemplate.opsForHash().put(attemptKey, "endTime", String.valueOf(endTime));
        redisTemplate.opsForHash().put(attemptKey, "disconnect_time", "0");
        return getCurrentQuestion(quizId, participantId);
    }

    public QuestionForUserDto switchQuestion(UUID quizId,
                                             UUID participantId, int newIndex, int tabSwitchCount) {

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
        recordTabSwitch(
                quizId,
                participantId,
                UUID.fromString(currentQuestionId),
                tabSwitchCount
        );
        long delta = now - lastTick;
        long HEARTBEAT_INTERVAL_MS = 20 * 1000L;
        long disconnectTime = attempt.get("disconnect_time") == null
                ? 0
                : Long.parseLong(attempt.get("disconnect_time").toString());
        long actualDisconnect = 0;

        if (delta > HEARTBEAT_INTERVAL_MS + 5000) {
            actualDisconnect = delta - HEARTBEAT_INTERVAL_MS;
        }

        long updatedDisconnectTime = disconnectTime + actualDisconnect;

        redisTemplate.opsForHash()
                .put(attemptKey, "disconnect_time",
                        String.valueOf(updatedDisconnectTime));

        long MAX_DISCONNECT_MS = 5 * 60 * 1000L;

        if (updatedDisconnectTime > MAX_DISCONNECT_MS) {
            redisTemplate.opsForHash()
                    .put(attemptKey, "status", "KICKED");

            throw new IllegalStateException("Disconnected too long. You have been removed from the exam.");
        }
        String timeKey = "q:" + currentQuestionId + ":time";
        Object spentObj = attempt.get(timeKey);
        long alreadySpent = spentObj == null
                ? 0
                : Long.parseLong((String) spentObj);
        QuestionForUserDto question = getCurrentQuestion(quizId, participantId);
        long questionDurationMs = question.getDuration() * 1000L;
        long newTotal = alreadySpent + delta;
        long remaining = questionDurationMs - newTotal;
        if (remaining > 0) {
            redisTemplate.opsForHash().increment(attemptKey, "q:" + currentQuestionId + ":time", delta);
        } else {
            redisTemplate.opsForHash().put(attemptKey, timeKey, String.valueOf(questionDurationMs));
        }
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
        if (selectedOption == null || selectedOption.isEmpty()) {
            redisTemplate.opsForHash()
                    .delete(answerKey, questionId);
            return;
        }

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
                selectedAnswer = objectMapper.readValue(savedAnswerJson.toString(), new TypeReference<>() {
                });
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
        }
        String tabField = "q:" + question.getQuestionId() + ":tabs";

        Object tabSwitchObj = attemptData.get(tabField);

        int tabSwitchCount = (tabSwitchObj == null)
                ? 0
                : Integer.parseInt(tabSwitchObj.toString());

        return ExamNavigationResponse.builder()
                .question(question)
                .currentIndex(Integer.parseInt((String) attemptData.get("currentIndex")))
                .remainingTimeMillis(questionRemainingTime)
                .globalRemainingTimeMillis(globalRemainingTime)
                .selectedAnswer(selectedAnswer)
                .status((String) attemptData.get("status"))
                .currentQuestionTabSwitches(tabSwitchCount)
                .build();
    }

    public int getTotalQuestions(UUID quizId, UUID participantId) {
        String orderKey = getQuestionOrderKey(quizId, participantId);
        Long size = redisTemplate.opsForList().size(orderKey);
        return size != null ? size.intValue() : 0;
    }

    public void doFinalSubmit(UUID quizId, UUID participantId) {
        System.out.println("final submit for " + participantId);
        String attemptKey = getAttemptKey(quizId, participantId);
        String answerKey = getAnswerKey(quizId, participantId);
        String orderKey = getQuestionOrderKey(quizId, participantId);
        List<UUID> questionIds = getShuffledOrderQuestionList(quizId, participantId);
        Map<Object, Object> attemptData = redisTemplate.opsForHash().entries(attemptKey);
        Map<Object, Object> answers = redisTemplate.opsForHash().entries(answerKey);
        String status = (String) attemptData.get("status");

        if (!"ACTIVE".equals(status)) {
            throw new IllegalStateException("Quiz not active or already submitted");
        }

        long now = System.currentTimeMillis();
        long endTime = Long.parseLong(attemptData.get("endTime").toString());
        long GRACE_PERIOD_MS = 5000;
        if (now > endTime + GRACE_PERIOD_MS) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Your attempt time has expired. Submission not allowed."
            );
        }

        List<QuestionAnalyticsUserDto> dtoList = new ArrayList<>();
        for (UUID questionId : questionIds) {

            String timeKey = "q:" + questionId + ":time";
            long timeSpentMillis = attemptData.get(timeKey) == null
                    ? 0
                    : Long.parseLong(attemptData.get(timeKey).toString());
            String tabKey = "q:" + questionId + ":tabs";
            int tabSwitches = attemptData.get(tabKey) == null
                    ? 0
                    : Integer.parseInt(attemptData.get(tabKey).toString());
            Map<String, Object> selectedAnswer = null;

            if (answers.containsKey(questionId.toString())) {
                try {
                    selectedAnswer = objectMapper.readValue(
                            answers.get(questionId.toString()).toString(),
                            new TypeReference<>() {
                            }
                    );
                } catch (Exception e) {
                    System.out.println(e.getMessage());
                }
            }

            int timeSpentSeconds = (int) (timeSpentMillis / 1000);

            QuestionAnalyticsUserDto dto = QuestionAnalyticsUserDto.builder()
                    .quizId(quizId)
                    .participantId(participantId)
                    .questionId(questionId)
                    .timeSpent(timeSpentSeconds)
                    .selectedAnswer(selectedAnswer)
                    .tabSwitchCount(tabSwitches)
                    .build();
            dtoList.add(dto);
        }
        analyticsUserService.createAnalyticsInBulk(dtoList, quizId, participantId);
        String submittedKey = getSubmittedParticipantsKey(quizId);
        Long submittedCount = redisTemplate.opsForValue().increment(submittedKey);

        String totalKey = getTotalParticipantsKey(quizId);
        String totalStr = redisTemplate.opsForValue().get(totalKey);

        if (totalStr != null) {
            long totalParticipants = Long.parseLong(totalStr);
            System.out.println(totalParticipants);
            System.out.println(submittedCount);
            if (submittedCount != null && submittedCount == totalParticipants) {
                quizService.endQuizEarly(quizId);
            }
        }
        redisTemplate.opsForHash()
                .put(attemptKey, "status", "SUBMITTED");

        redisTemplate.delete(attemptKey);
        redisTemplate.delete(answerKey);
        redisTemplate.delete(orderKey);
    }
}
