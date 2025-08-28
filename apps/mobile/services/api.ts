import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Reuniao } from "../types";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const deviceId = await AsyncStorage.getItem("deviceId");
    if (deviceId) {
      config.headers["x-device-id"] = deviceId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem("accessToken", res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        // Redirect to login or handle logout
      }
    }
    return Promise.reject(error);
  }
);

export const getReuniaoById = async (id: string): Promise<Reuniao> => {
  try {
    const response = await api.get(`/reunioes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar reunião:", error);
    throw error;
  }
};

