import apiClient from "../config/ApiClient";

export const registerUser = async (signupData) => {
  const response = await apiClient.post(`/register`, signupData);
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await apiClient.post(`/login`, loginData);
  return response.data;
};

export const logoutUser = async () => {
  await apiClient.post(`/logout`);
  return;
};

export const refreshToken = async () => {
  const response = await apiClient.post("/refresh");
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await apiClient.post(`/quiz`, quizData);
  return response.data;
};

export const getQuizsByHostId = async (hostId) => {
  const response = await apiClient.get(`/quiz/host`);
  return response.data;
};

export const getQuizById = async (quizId) => {
  const response = await apiClient.get(`/quiz/${quizId}`);
  return response.data;
};
export const getQuizForParticipantById = async (quizId) => {
  const response = await apiClient.get(`/quizForParticipant/${quizId}`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await apiClient.post(`/question`, questionData);
  return response.data;
};

export const getQuestionsByQuizId = async (quizId) => {
  const response = await apiClient.get(`/questions/${quizId}`);
  // console.log(response)
  return response.data;
};

export const updateQuestionById = async (questionId, patchData) => {
  const response = await apiClient.put(`/question/${questionId}`, patchData);
  return response.data;
};

export const deleteQuestionById = async (questionId) => {
  await apiClient.delete(`/question/${questionId}`);
  return;
};

export const createParticipant = async (participantData) => {
  const response = await apiClient.post(`/participant`, participantData);
  return response.data;
};

export const createQuizSession = async ({ quizId }) => {
  const response = await apiClient.post(
    `/quiz-session/create`,
    {},
    { params: { quizId } },
  );
  return response.data;
};

export const getParticipantAnalytics = async (participantId) => {
  const response = await apiClient.get(
    `/question-analytics-user/participant/${participantId}`,
  );
  // console.log(response)
  return response.data;
};

export const getLeaderboardByQuizId = async (quizId) => {
  const response = await apiClient.get(`/quiz/${quizId}/leaderboard`);
  return response.data;
};

export const getQuizSessionBySessionId = async (sessionId) => {
  const response = await apiClient.get(
    `/quiz-session/${sessionId}/host-reconnect`,
  );
  return response.data;
};

export const createQuestionAnalyticsUser = async (
  QuestionAnalyticsUserData,
) => {
  const response = await apiClient.post(
    `/question-analytics-user`,
    QuestionAnalyticsUserData,
  );
  return response.data;
};

export const endQuiz = async (quizId) => {
  const response = await apiClient.post(`/quiz/${quizId}/end`);
  return response.data;
};
export const deleteQuiz = async (quizId) => {
  const response = await apiClient.delete(`/quiz/${quizId}`);
  return response.data;
};

export const addUserToParticipant = async (participantId, userId) => {
  const response = await apiClient.put(
    `/participant/${participantId}/user/${userId}`,
  );
  return response.data;
};

export const getParticipantByUserId = async (userId) => {
  const response = await apiClient.get(`/participants/user`);
  return response.data;
};

// This fetches the fully projected data in one go
export const getParticipantHistory = async (userId) => {
  const response = await apiClient.get(`/participants/history`);
  return response.data;
};

export const updateProfile = async (newUserProfile) => {
  console.log(newUserProfile);
  const response = await apiClient.put(`users`, newUserProfile);
  return response.data;
};

export const getQuizIdSessionIdByCode = async (joinCode) => {
  const response = await apiClient.get(`quiz-session/${joinCode}`);
  return response.data;
};

export const AIGenQuestions = async (quizId, promptData) => {
  const response = await apiClient.post(
    `quizzes/generate-with-ai/${quizId}`,
    promptData,
  );
  return response.data;
};

export const createAllQAQByQuizId = async (quizId) => {
  const response = await apiClient.post(`/question-analytics-quiz/${quizId}`);
  return response.data;
};

export const getDetailedQAQ = async (quizId) => {
  const response = await apiClient.get(
    `/question-analytics-quiz/quiz/${quizId}/detailed`,
  );
  return response.data;
};
export const getParticipantSessionByParticipantIdAndSessionId = async (
  participantId,
  sessionId,
) => {
  const response = await apiClient.get(
    `/quiz-session/${sessionId}/participant-reconnect/${participantId}`,
  );
  return response.data;
};

export const updateQuizById = async (quizId, quizData) => {
  const response = await apiClient.put(`/quiz/${quizId}`, quizData);
  return response.data;
};

export const verifyEmail = async (VerificationData) => {
  const response = await apiClient.post(`/verify-otp`, VerificationData);
  return response.data;
};

export const getAllAllowedUser = async (quizId) => {
  const response = await apiClient.get(`/allowed-user/quiz/${quizId}`);
  return response.data;
};

export const sendInvitationToAll = async (quizId) => {
  const response = await apiClient.post(`/quiz/${quizId}/invitations/send-all`);
  return response.data;
};

export const sendInvitationToSelected = async (quizId, allowedUserIds) => {
  const response = await apiClient.post(`/quiz/${quizId}/invitations/send-selected`, allowedUserIds);
  return response.data;
};

export const sendInvitation = async (quizId, allowedUserId) => {
  const response = await apiClient.post(
    `/quiz/${quizId}/invitations/${allowedUserId}/send`,
  );
  return response.data;
};

export const registerExam = async (registrationData) => {
  console.log(registrationData);
  const response = await apiClient.post(`/exam/register`, registrationData);
  return response.data;
};

export const sendJoinLinkToRegistered = async (quizId) => {
  const response = await apiClient.post(`/quiz/${quizId}/join-link/send-all`);
  return response.data;
};

export const verifyParticipant = async (participantData) => {
  const response = await apiClient.post(`/exam-room/verify`, participantData);
  return response.data;
};

export const checkStatusForRegistered = async (token) => {
  const response = await apiClient.get(`/exam/register-status/${token}`);
  return response.data;
};

export const startExamQuiz = async (quizId, participantId) => {
  const response = await apiClient.post(`/exam-room/${quizId}/start`);
  return response.data;
};

export const switchQuestion = async (
  quizId,
  participantId,
  targetIndex,
  tabSwitchCount,
) => {
  const response = await apiClient.post(
    `/exam-room/${quizId}/switchTo/${targetIndex}`,
    {
      tabSwitchCount: tabSwitchCount,
    },
  );

  return response.data;
};

export const submitAnswer = async (quizId, participantId, selectedAnswer) => {
  const response = await apiClient.post(
    `/exam-room/${quizId}/submit-answer`,
    selectedAnswer,
  );
  return response.data;
};

export const submitTest = async (quizId, participantId) => {
  const response = await apiClient.post(`/exam-room/${quizId}/submit-test`);
};

export const importGoogleForm = async (quizId, formUrl) => {
  const response = await apiClient.post(`/google-form-import`, {
    formUrl,
    quizId,
  });
  console.log(response.data);
  return response.data;
};

export const getPendingTeachers = async () => {
  const response = await apiClient.get(`/admin/teachers/pending`);
  return response.data;
};

export const approveTeacherByEmail = async (email, isApproved) => {
  const decision = {
    approved: isApproved,
    reason: isApproved
      ? "Welcome to QuizIt!"
      : "Request declined by administrator.",
  };
  const response = await apiClient.post(
    `/admin/teachers/approve/${email}`,
    decision,
  );
  return response.data;
};

export const getApprovedTeachers = async () => {
  const response = await apiClient.get(`/admin/teachers/approved`);
  return response.data;
};

export const getApprovedAdmins = async () => {
  const response = await apiClient.get(`/admins/approved`);
  return response.data;
};

// Revoke Teacher
export const revokeTeacher = async (email) => {
  const response = await apiClient.patch(
    `/admin/teachers/email/${email}/revoke`,
  );
  return response.data;
};

// Revoke Admin
export const revokeAdmin = async (email) => {
  const response = await apiClient.patch(`/admin/admins/email/${email}/revoke`);
  return response.data;
};

// Approve Teacher
export const approveTeacher = async (email) => {
  const response = await apiClient.patch(
    `/admin/teachers/email/${email}/approve`,
  );
  return response.data;
};

// Approve Admin
export const approveAdmin = async (email) => {
  const response = await apiClient.patch(
    `/admin/admins/email/${email}/approve`,
  );
  return response.data;
};

export const endQuizEarlyFromHost = async (quizId) => {
  const response = await apiClient.post(`/quiz/${quizId}/end-early`);
  return response.data;
};

export const publishResultForQuiz = async (quizId) => {
  const response = await apiClient.post(`/quiz/${quizId}/publish-result`)
  return response.data;
}