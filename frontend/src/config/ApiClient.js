import axios from 'axios';
import useAuth from '../auth/store';
import { refreshToken } from '../services/AuthService';
const apiClient = axios.create({
    baseURL: import.meta.env.API_BASE_URL || 'http://localhost:3000/quizit',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    timeout: 10000
});

apiClient.interceptors.request.use((config) => {

    const accessToken = useAuth.getState().accessToken;

    if (accessToken) {
        console.log(accessToken)
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
})

let isRefreshing = false;
let pending = [];
function queueRequest(cb) {
    pending.push(cb);
}

function resolveQueue(newToken) {
    pending.forEach((cb) => cb(newToken));
    pending = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {

        const original = error.config;

        if (error.response?.status !== 401 || error.response?.data?.message !== "token expired" || original.url.includes('/refresh')) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => { // Fixed parameter name from response to resolve
                queueRequest((newToken) => {
                    if (!newToken) return reject(error);
                    original.headers.Authorization = `Bearer ${newToken}`;
                    resolve(apiClient(original));
                });
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const loginResponse = await refreshToken();
            const newToken = loginResponse.accessToken;
            const user = loginResponse.user; // Ensure you get the user from response

            if (!newToken) throw new Error("No access token received!");

            // ✅ FIX: Use useAuth.getState() directly. 
            // Do NOT call useAuth() as a function.
            useAuth.getState().setLocalData(newToken, user, true);

            resolveQueue(newToken);

            original.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(original);
        } catch (refreshError) {
            const status = refreshError.response?.status;
            const message = refreshError.response?.data?.message;

            if (
                status === 400 &&
                message === "Refresh token is revoked"
            ) {
                useAuth.getState().logout();
            }

            return Promise.reject(refreshError);
        }
        finally {
            isRefreshing = false;
        }
    }
);
export default apiClient;