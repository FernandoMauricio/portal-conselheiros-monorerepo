import axios from 'axios';
import Constants from 'expo-constants';

const baseURL =
    Constants.expoConfig?.extra?.apiUrl ||
    (Constants.manifest as any)?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({ baseURL });

// exemplo: GET reunião por id
export const getReuniaoById = async (id: string) => {
    const { data } = await api.get(`/reunioes/${id}`);
    return data;
};
