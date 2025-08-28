import axios from "axios";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

export const verifyPresence = async (photoPath: string, reuniaoId: string, deviceId: string) => {
  try {
    const formData = new FormData();
    formData.append("photo", {
      uri: photoPath,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);
    formData.append("reuniaoId", reuniaoId);

    const response = await axios.post(`${API_URL}/conselheiros/verify-presence`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-device-id": deviceId,
      },
    });

    return { success: true, conselheiro: response.data.conselheiro };
  } catch (error: any) {
    console.error("Erro ao verificar presença:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || "Erro desconhecido" };
  } finally {
    // Clean up the temporary photo file
    await FileSystem.deleteAsync(photoPath, { idempotent: true });
  }
};

