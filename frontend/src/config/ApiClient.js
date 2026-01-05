import axios from 'axios';
import useAuth from '../auth/store';
const apiClient = axios.create({
    baseURL: import.meta.env.API_BASE_URL || 'http://localhost:3000/quizit',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials:true,
    timeout:10000
});

apiClient.interceptors.request.use((config)=>{
    
    const accessToken = useAuth.getState().accessToken;

    if(accessToken)
    {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
})
export default apiClient;