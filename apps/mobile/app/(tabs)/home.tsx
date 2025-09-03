// app/(tabs)/home.tsx
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type Health = 'idle' | 'ok' | 'fail';

export default function HomeTab() {
    const { deviceId, token } = useAuth() as any;

    const API = useMemo(
        () =>
            (Constants.expoConfig?.extra as any)?.apiUrl ||
            (Constants.manifest as any)?.extra?.apiUrl ||
            process.env.EXPO_PUBLIC_API_URL,
        []
    );

    const MEDIA = useMemo(
        () =>
            (Constants.expoConfig?.extra as any)?.mediaUrl ||
            (Constants.manifest as any)?.extra?.mediaUrl ||
            process.env.EXPO_PUBLIC_MEDIA_URL,
        []
    );

    const LIVEKIT_WS = useMemo(
        () =>
            (Constants.expoConfig?.extra as any)?.livekitWsUrl ||
            (Constants.manifest as any)?.extra?.livekitWsUrl ||
            process.env.EXPO_PUBLIC_LIVEKIT_WS_URL,
        []
    );

    const [apiHealth, setApiHealth] = useState<Health>('idle');
    const [mgHealth, setMgHealth] = useState<Health>('idle');
    const [loading, setLoading] = useState(true);

    const check = useCallback(async (url?: string) => {
        if (!url) return 'fail';
        try {
            const r = await fetch(`${url.replace(/\/$/, '')}/health`);
            const j = await r.json().catch(() => ({}));
            return r.ok && (j.status === 'ok' || j.message) ? 'ok' : 'fail';
        } catch {
            return 'fail';
        }
    }, []);

    const run = useCallback(async () => {
        setLoading(true);
        const [a, m] = await Promise.all([check(API), check(MEDIA)]);
        setApiHealth(a as Health);
        setMgHealth(m as Health);
        setLoading(false);
    }, [API, MEDIA, check]);

    useEffect(() => {
        run();
    }, [run]);

    const pill = (h: Health) => {
        const bg =
            h === 'ok' ? 'bg-emerald-700' : h === 'fail' ? 'bg-red-700' : 'bg-zinc-700';
        const label = h === 'ok' ? 'OK' : h === 'fail' ? 'Falha' : '...';
        return <Text className={`px-2 py-1 rounded text-white text-xs ${bg}`}>{label}</Text>;
    };

    return (
        <View className="flex-1 bg-black p-16 items-center justify-center">
            <Text className="text-white text-3xl font-extrabold mb-8 text-center">
                Portal dos Conselheiros
            </Text>

            {/* Device box */}
            <View className="w-full max-w-xl bg-zinc-900 rounded-2xl p-5 mb-6">
                <Text className="text-zinc-400 text-sm mb-1">Device ID</Text>
                <View className="flex-row justify-between items-center">
                    <Text className="text-white flex-1 mr-3" numberOfLines={1}>
                        {deviceId || '—'}
                    </Text>
                    <TouchableOpacity
                        className="bg-zinc-800 px-3 py-2 rounded-lg"
                        onPress={async () => {
                            if (deviceId) await Clipboard.setStringAsync(deviceId);
                        }}
                    >
                        <Text className="text-white text-sm">Copiar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Health checks */}
            <View className="w-full max-w-xl bg-zinc-900 rounded-2xl p-5 mb-10">
                <Text className="text-white text-lg font-semibold mb-3">Diagnóstico</Text>

                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-zinc-300">API</Text>
                    {pill(apiHealth)}
                </View>
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-zinc-300">Media Gateway</Text>
                    {pill(mgHealth)}
                </View>
                <View className="flex-row items-center justify-between">
                    <Text className="text-zinc-300">LiveKit WS</Text>
                    <Text className="text-zinc-400" numberOfLines={1} style={{ maxWidth: 220 }}>
                        {LIVEKIT_WS || '—'}
                    </Text>
                </View>

                <TouchableOpacity
                    className="mt-4 bg-zinc-800 px-4 py-3 rounded-xl items-center"
                    onPress={run}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white">Reverificar</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Atalhos */}
            <View className="w-full max-w-xl flex-row gap-x-4">
                <TouchableOpacity
                    className="flex-1 bg-blue-600 px-4 py-4 rounded-2xl items-center"
                    onPress={() => router.push('/(tabs)/reunioes' as any)}
                >
                    <Text className="text-white font-semibold">Abrir Reuniões</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 bg-emerald-600 px-4 py-4 rounded-2xl items-center"
                    onPress={() =>
                        router.push({ pathname: '/sala', params: { reuniaoId: '2a62c850-83d1-444f-bb9d-8f35162542c5' } } as any)
                    }
                >
                    <Text className="text-white font-semibold">Entrar na Sala (demo)</Text>
                </TouchableOpacity>
            </View>

            {/* Abrir broadcast no navegador deste device (opcional) */}
            <TouchableOpacity
                className="mt-6"
                onPress={() => Linking.openURL('http://localhost:5173/broadcast?room=demo-room-01&name=apresentador')}
            >
                <Text className="text-blue-400 underline">Abrir Broadcast (demo) no navegador</Text>
            </TouchableOpacity>
        </View>
    );
}
