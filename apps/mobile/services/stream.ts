import axios from "axios";
import Constants from "expo-constants";

const MEDIA_GATEWAY_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_MEDIA_URL || "http://localhost:3002/api";

export const generateLiveKitToken = async (
  roomName: string,
  participantIdentity: string,
  participantName: string,
  canPublish: boolean,
  canSubscribe: boolean,
  canPublishData: boolean,
  canPublishSources?: string[]
): Promise<string> => {
  try {
    const response = await axios.post(`${MEDIA_GATEWAY_URL}/tokens/generate`, {
      roomName,
      participantIdentity,
      participantName,
      canPublish,
      canSubscribe,
      canPublishData,
      canPublishSources,
    });
    return response.data.token;
  } catch (error) {
    console.error("Erro ao gerar token LiveKit:", error);
    throw error;
  }
};

