import useAuth from "../auth/store";
import apiClient from "../config/ApiClient";

export const registerUser = async(signupData)=>{
    const response  = await apiClient.post(`/register`,signupData)
    return response.data;
}

export const loginUser = async(loginData)=>{
    const response = await apiClient.post(`/login`,loginData)
    return response.data;
}

export const logoutUser = async()=>{
    await apiClient.post(`/logout`);
    return;
}

export const getQuizsByHostId = async(hostId)=>{
   const response =  await apiClient.get(`/quiz/host/${hostId}`);
   return response.data;
}

export const getQuizById = async (quizId) => {
  const response = await apiClient.get(`/quiz/${quizId}`);
  console.log(response.data)
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await apiClient.post(`/quizit/question`, questionData);
  return response.data;
};

export const getQuestionsByQuizId = async (quizId) => {
  const response = await apiClient.get(`/quizit/questions/${quizId}`);
  console.log(response.data)
  return response.data;
};

export const updateQuestionById = async (questionId, patchData) => {
  const response = await apiClient.put(`/quizit/question/${questionId}`, patchData);
  return response.data;
};

export const deleteQuestionById = async (questionId) => {
  await apiClient.delete(`/quizit/question/${questionId}`);
  return;
};