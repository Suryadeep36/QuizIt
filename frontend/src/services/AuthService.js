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