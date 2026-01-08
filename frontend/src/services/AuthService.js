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
  const response = await apiClient.get(`/quiz/host/${hostId}`);
  return response.data;
};

export const getQuizById = async (quizId) => {
  const response = await apiClient.get(`/quiz/${quizId}`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await apiClient.post(`/question`, questionData);
  return response.data;
};

export const getQuestionsByQuizId = async (quizId) => {
  const response = await apiClient.get(`/questions/${quizId}`);
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
