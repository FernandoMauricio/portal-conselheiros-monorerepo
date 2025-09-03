import { api } from './api';

export async function verifyPresence(imagePath: string, reuniaoId: string, deviceId: string) {
    const form = new FormData();
    const fileUri = `file://${imagePath}`;
    form.append('image', {
        // @ts-ignore
        uri: fileUri,
        name: 'face.jpg',
        type: 'image/jpeg',
    });
    form.append('reuniaoId', reuniaoId);
    form.append('deviceId', deviceId);

    const res = await fetch(`${api.defaults.baseURL}/conselheiros/verificar`, {
        method: 'POST',
        body: form as any,
        headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Falha ao verificar presença');
    }
    return res.json();
}
