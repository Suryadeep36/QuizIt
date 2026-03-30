CREATE TABLE quiz_allowed_users
(
    allowed_user_id        UUID         NOT NULL,
    email                  VARCHAR(255) NOT NULL,
    token                  VARCHAR(255),
    registered             BOOLEAN      NOT NULL,
    token_expiry           TIMESTAMP WITHOUT TIME ZONE,
    quiz_id                UUID         NOT NULL,
    invitation_status      VARCHAR(255),
    invitation_sent_at     TIMESTAMP WITHOUT TIME ZONE,
    delivery_error_message VARCHAR(255),
    CONSTRAINT pk_quiz_allowed_users PRIMARY KEY (allowed_user_id)
);

ALTER TABLE quiz_allowed_users
    ADD CONSTRAINT uc_3ee6b4e2b94044af8502c577e UNIQUE (quiz_id, email);

ALTER TABLE quiz_allowed_users
    ADD CONSTRAINT uc_8e8f54c8e87303dba436d50fe UNIQUE (token);

ALTER TABLE quiz_allowed_users
    ADD CONSTRAINT FK_QUIZ_ALLOWED_USERS_ON_QUIZ FOREIGN KEY (quiz_id) REFERENCES quiz (quiz_id);