import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// adiciona Authorization
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// refresh token
api.interceptors.response.use(
    (r) => r,
    async (error) => {
        const status = error?.response?.status;
        const originalRequest: AxiosRequestConfig & { _retry?: boolean; } = error.config || {};
        if ((status === 401 || status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
                    const newAccess = res.data.accessToken;
                    localStorage.setItem("accessToken", newAccess);
                    originalRequest.headers = originalRequest.headers ?? {};
                    (originalRequest.headers as any).Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest);
                } catch {
                    // logout
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("userEmail");
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
