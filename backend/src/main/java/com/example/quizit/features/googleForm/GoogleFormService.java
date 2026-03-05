package com.example.quizit.features.googleForm;

import com.example.quizit.features.GoogleCredential.EncryptionService;
import com.example.quizit.features.GoogleCredential.GoogleCredential;
import com.example.quizit.features.GoogleCredential.GoogleCredentialRepository;
import com.example.quizit.features.GoogleCredential.GoogleCredentialService;
import com.example.quizit.features.googleForm.dtos.*;
import com.example.quizit.features.googleForm.dtos.Question;
import com.example.quizit.features.googleForm.helpers.NumericValidator;
import com.example.quizit.features.question.*;
import com.example.quizit.features.user.User;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GoogleFormService {

    private final EncryptionService encryptionService;
    private final GoogleCredentialRepository googleCredentialRepository;
    private final GoogleCredentialService googleCredentialService;
    private final JsonMapper jsonMapper;
    private final QuestionService questionService;

    public String extractFormId(String url) {
        String[] parts = url.split("/");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].equals("d") || parts[i].equals("e")) {
                return parts[i + 1];
            }
        }
        throw new RuntimeException("Invalid Google Form URL");
    }

    public String importForm(String formUrl, User user) {

        String formId = extractFormId(formUrl);

        GoogleCredential credential = googleCredentialRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Google account not linked"));
        String decryptedRefreshToken = encryptionService.decrypt(credential.getRefreshToken());

        String accessToken = googleCredentialService.generateAccessToken(decryptedRefreshToken);
        String formJson = googleCredentialService.fetchFormJson(formId, accessToken);

        System.out.println(formJson); // temporary
        // 5. Parse questions
        // 6. Save Quiz + Questions in DB

        return formJson; // temporary
    }

    public List<QuestionDto> storeQuestionInQuiz(UUID quizId, UUID userId, String jsonString) {

        if (quizId == null || userId == null) {
            throw new IllegalArgumentException("QuizId and UserId must not be null");
        }

        if (jsonString == null || jsonString.isBlank()) {
            throw new IllegalArgumentException("Google Form JSON cannot be null or empty");
        }

        Root root;
        try {
            root = jsonMapper.readValue(jsonString, Root.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Google Form JSON", e);
        }

        if (root == null || root.items == null || root.items.isEmpty()) {
            return Collections.emptyList();
        }

        List<QuestionDto> questionDtoList = new ArrayList<>();

        for (Item item : root.items) {
            if (item == null) continue;
            if (item.questionItem == null && item.questionGroupItem == null) {
                continue;
            }

            QuestionDto dto = new QuestionDto();
            dto.setQuizId(quizId);
            dto.setContent(
                    item.title != null ? item.title : "Untitled Question"
            );
            dto.setDuration(30);
            dto.setDifficultyLevel(DifficultyLevel.EASY);
            dto.setOptions(Collections.emptyMap());
            dto.setAllowMultipleAnswers(false);
            dto.setPoints(0);

            if (item.imageItem != null &&
                    item.imageItem.image != null &&
                    item.imageItem.image.contentUri != null) {

                dto.setImageUrl(item.imageItem.image.contentUri);
            }

            if (item.questionItem != null && item.questionItem.question != null) {
                Question question = item.questionItem.question;
                if (question.scaleQuestion != null) {
                    continue;
                }
                if (question.choiceQuestion != null &&
                        question.choiceQuestion.options != null &&
                        !question.choiceQuestion.options.isEmpty()) {
                    ChoiceQuestion choice = question.choiceQuestion;
                    dto.setQuestionType(QuestionType.MCQ);
                    Map<String, Object> optionMap = new LinkedHashMap<>();
                    char key = 'A';
                    for (Option option : choice.options) {
                        if (option != null && option.value != null) {
                            optionMap.put(String.valueOf(key), option.value);
                            key++;
                        }
                    }
                    dto.setOptions(optionMap);
                    dto.setAllowMultipleAnswers("CHECKBOX".equalsIgnoreCase(choice.type));
                    if (question.grading != null &&
                            question.grading.correctAnswers != null &&
                            question.grading.correctAnswers.answers != null) {

                        List<AnswerKey> answerKeyList = new ArrayList<>();
                        for (Answer answer : question.grading.correctAnswers.answers) {
                            if (answer == null || answer.value == null) continue;
                            for (Map.Entry<String, Object> entry : optionMap.entrySet()) {
                                if (entry.getValue().equals(answer.value)) {
                                    AnswerKey keyObj = new AnswerKey();
                                    keyObj.setKey(entry.getKey());
                                    answerKeyList.add(keyObj);
                                }
                            }
                        }
                        dto.setCorrectAnswer(answerKeyList);
                        dto.setPoints(
                                Objects.requireNonNullElse(
                                        question.grading.pointValue, 0
                                )
                        );
                    }
                }

                else if (question.textQuestion != null) {
                    dto.setCaseSensitive(false);
                    dto.setQuestionType(QuestionType.SHORT_ANSWER);
                    if (question.grading != null &&
                            question.grading.correctAnswers != null &&
                            question.grading.correctAnswers.answers != null &&
                            !question.grading.correctAnswers.answers.isEmpty()) {
                        List<AnswerKey> answerKeyList = new ArrayList<>();
                        List<String> acceptableAnswers = new ArrayList<>();
                        for (Answer answer : question.grading.correctAnswers.answers) {
                            if (answer == null || answer.value == null) continue;
                            acceptableAnswers.add(answer.value);
                            AnswerKey keyObj = new AnswerKey();
                            keyObj.setKey(answer.value);
                            answerKeyList.add(keyObj);
                        }
                        dto.setCorrectAnswer(answerKeyList);
                        dto.setAcceptableAnswers(acceptableAnswers);
                        dto.setAllowMultipleAnswers(acceptableAnswers.size() > 1);
                        if (acceptableAnswers.size() == 1) {
                            String value = acceptableAnswers.getFirst();
                            if (NumericValidator.isFloat(value) ||
                                    NumericValidator.isInteger(value)) {
                                dto.setQuestionType(QuestionType.NUMERICAL);
                            } else if ("true".equalsIgnoreCase(value) ||
                                    "false".equalsIgnoreCase(value)) {
                                dto.setQuestionType(QuestionType.TRUE_FALSE);
                                Map<String, Object> option = new LinkedHashMap<>();
                                option.put("TRUE", "True");
                                option.put("FALSE", "False");
                                dto.setOptions(option);
                            }
                        }
                        dto.setPoints(
                                Objects.requireNonNullElse(
                                        question.grading.pointValue, 0
                                )
                        );
                    }
                }
            } else if (item.questionGroupItem != null &&
                    item.questionGroupItem.grid != null &&
                    item.questionGroupItem.grid.columns != null &&
                    "RADIO".equalsIgnoreCase(item.questionGroupItem.grid.columns.type)) {
                dto.setQuestionType(QuestionType.MATCH_FOLLOWING);
                Map<String, Object> options = new LinkedHashMap<>();
                Map<String, Integer> leftMap = new LinkedHashMap<>();
                Map<String, Integer> rightMap = new LinkedHashMap<>();
                int index = 0;
                if (item.questionGroupItem.questions != null) {
                    for (Question q : item.questionGroupItem.questions) {
                        if (q != null &&
                                q.rowQuestion != null &&
                                q.rowQuestion.title != null) {
                            leftMap.put(q.rowQuestion.title, index++);
                        }
                    }
                }
                index = 0;
                if (item.questionGroupItem.grid.columns.options != null) {
                    for (Option option : item.questionGroupItem.grid.columns.options) {
                        if (option != null && option.value != null) {
                            rightMap.put(option.value, index++);
                        }
                    }
                }
                options.put("LEFT", new ArrayList<>(leftMap.keySet()));
                options.put("RIGHT", new ArrayList<>(rightMap.keySet()));
                dto.setOptions(options);
                Map<String, String> matchPairs = new LinkedHashMap<>();
                if (item.questionGroupItem.questions != null) {
                    for (Question q : item.questionGroupItem.questions) {
                        if (q == null ||
                                q.rowQuestion == null ||
                                q.rowQuestion.title == null ||
                                q.grading == null ||
                                q.grading.correctAnswers == null ||
                                q.grading.correctAnswers.answers == null ||
                                q.grading.correctAnswers.answers.isEmpty()) {
                            continue;
                        }
                        String left = q.rowQuestion.title;
                        String correct = q.grading.correctAnswers.answers.getFirst().value;
                        if (leftMap.containsKey(left) && rightMap.containsKey(correct)) {
                            matchPairs.put(
                                    String.valueOf(leftMap.get(left)),
                                    String.valueOf(rightMap.get(correct))
                            );
                        }
                    }
                }
                AnswerKey keyObj = new AnswerKey();
                keyObj.setMatchPairs(matchPairs);
                dto.setCorrectAnswer(List.of(keyObj));
            } else {
                continue;
            }
            questionDtoList.add(dto);
        }
        return questionService.createQuestion(questionDtoList, userId);
    }
}