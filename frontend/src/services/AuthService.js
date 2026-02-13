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

export const refreshToken= async ()=>{
   const response =  await apiClient.post("/refresh");
   return response.data;
}

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
  console.log(response)
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

export const createQuizSession = async ({ quizId, hostId }) => {
  const response = await apiClient.post(
    `/quiz-session/create`,
    {},
    { params: { quizId, hostId } }
  );
  return response.data;
};

export const getParticipantAnalytics = async (participantId) => {
  const response = await apiClient.get(
    `/question-analytics-user/participant/${participantId}`
  );
  console.log(response)
  return response.data;
};

export const getLeaderboardByQuizId = async (quizId) => {
  const response = await apiClient.get(`/quiz/${quizId}/leaderboard`);
  return response.data;
};

export const getQuizSessionBySessionId = async (sessionId) => {
  const response = await apiClient.get(
    `/quiz-session/${sessionId}/host-reconnect`
  )
  return response.data;
}

export const createQuestionAnalyticsUser = async (QuestionAnalyticsUserData) => {
  const response = await apiClient.post(`/question-analytics-user`,QuestionAnalyticsUserData)
  return response.data;
}

export const endQuiz = async (quizId) => {
  const response = await apiClient.post(`/quiz/${quizId}/end`);
  return response.data;
}
export const deleteQuiz = async (quizId) => {
  const response = await apiClient.delete(`/quiz/${quizId}`);
  return response.data;
}

export const addUserToParticipant = async (participantId,userId) => {
  const response = await apiClient.put(`/participant/${participantId}/user/${userId}`);
  return response.data;
}

export const getParticipantByUserId = async (userId) => {
  const response = await apiClient.get(`/participants/user/${userId}`);
  return response.data;
}


// This fetches the fully projected data in one go
export const getParticipantHistory = async (userId) => {
  const response = await apiClient.get(`/participants/history/${userId}`);
  return response.data;
};

export const updateProfile = async (newUserProfile) => {
  console.log(newUserProfile)
  const response = await apiClient.put(`users/${newUserProfile.id}`,newUserProfile);
  return response.data;
}

export const getQuizIdSessionIdByCode = async (joinCode) => {
  const response = await apiClient.get(`quiz-session/${joinCode}`);
  return response.data;
};