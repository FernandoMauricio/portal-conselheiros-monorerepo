import * as Application from "expo-application";
import Constants from "expo-constants";
import axios from "axios";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

export const getUniqueDeviceId = (): string => {
  // For development, use a fixed ID or a combination of constants
  if (process.env.NODE_ENV === "development" || Constants.expoConfig?.extra?.EXPO_PUBLIC_DEV_MODE) {
    return `dev-${Application.applicationId || "unknown"}-${Constants.installationId}`;
  }
  // For production, use a more robust unique ID
  return Application.androidId || Application.iosId || Constants.installationId;
};

export const checkDeviceAuthorization = async (deviceId: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/devices/${deviceId}`, {
      headers: {
        "x-device-id": deviceId,
      },
    });
    return response.data.autorizado;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // Device not found, consider it unauthorized
      return false;
    }
    console.error("Erro ao verificar autorização do dispositivo:", error);
    throw new Error("Não foi possível verificar a autorização do dispositivo.");
  }
};

export const registerDevice = async (deviceId: string, model?: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/devices`, {
      deviceId,
      modelo: model || Constants.deviceName,
      autorizado: false, // Devices are unauthorized by default upon registration
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar dispositivo:", error);
    throw new Error("Não foi possível registrar o dispositivo.");
  }
};

