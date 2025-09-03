import axios from 'axios';
import Constants from 'expo-constants';

const mediaUrl =
    Constants.expoConfig?.extra?.mediaUrl ||
    (Constants.manifest as any)?.extra?.mediaUrl ||
    process.env.EXPO_PUBLIC_MEDIA_URL;

// Gera token de acesso à sala LiveKit via seu Media Gateway
export async function generateLiveKitToken(
    roomName: string,
    identity: string,
    name: string,
    canPublish: boolean,
    canSubscribe: boolean,
    isAuditor: boolean
): Promise<string> {
    const { data } = await axios.post(`${mediaUrl}/stream/token`, {
        roomName, identity, name, canPublish, canSubscribe, isAuditor
    });
    return data?.token;
}
