// app/sala.tsx
import {
    LiveKitRoom,
    useTracks
} from '@livekit/react-native';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { Track } from 'livekit-client';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import ParticipantTile from '../components/ParticipantTile';

import DeviceGuard from '../components/DeviceGuard';
import { useAuth } from '../contexts/AuthContext';
import { getReuniaoById } from '../services/api';
import { generateLiveKitToken } from '../services/stream';

type Reuniao = {
    id: string;
    titulo: string;
    descricao?: string;
    streamRoomId?: string | null;
};

export default function SalaScreen() {
    const { reuniaoId } = useLocalSearchParams<{ reuniaoId: string }>();
    const { deviceId } = useAuth();

    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reuniao, setReuniao] = useState<Reuniao | null>(null);

    const serverUrl =
        (Constants.expoConfig?.extra as any)?.livekitWsUrl ||
        (Constants.manifest as any)?.extra?.livekitWsUrl ||
        process.env.EXPO_PUBLIC_LIVEKIT_WS_URL;

    useEffect(() => {
        const run = async () => {
            if (!reuniaoId || !deviceId) {
                setError('ID da reunião ou do dispositivo ausente.');
                setLoading(false);
                return;
            }
            try {
                const fetched = await getReuniaoById(String(reuniaoId));
                setReuniao(fetched);

                // Fallback para simulação, caso streamRoomId esteja nulo
                const roomId = fetched.streamRoomId ?? 'demo-room-01';

                const tk = await generateLiveKitToken(
                    roomId,
                    deviceId,
                    `tablet-${deviceId}`,
                    false, // canPublish
                    true,  // canSubscribe
                    true   // isAuditor
                );
                setToken(tk);
            } catch (e: any) {
                console.error('Erro ao buscar reunião/gerar token:', e);
                setError(e?.message ?? 'Erro ao carregar a sala de transmissão.');
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [reuniaoId, deviceId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <ActivityIndicator color="#fff" />
                <Text className="text-white mt-4">Carregando sala...</Text>
            </View>
        );
    }

    if (error || !serverUrl) {
        return (
            <View className="flex-1 justify-center items-center bg-black p-6">
                <Text className="text-red-500 text-center mb-4">
                    {error || 'URL do LiveKit não configurada.'}
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-8 bg-blue-600 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white">Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!token || !reuniao) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white">Token ou dados da reunião indisponíveis.</Text>
            </View>
        );
    }

    return (
        <DeviceGuard>
            <LiveKitRoom
                serverUrl={serverUrl}
                token={token}
                // viewer-only: NÃO publicar câmera/mic do tablet
                audio={false}
                video={false}
                onConnected={() => console.log('Conectado à sala LiveKit!')}
                onDisconnected={() => console.log('Desconectado da sala LiveKit.')}
                onError={(e) => console.error('Erro LiveKit:', e)}
            >
                <View className="flex-1 bg-black">
                    {/* Cabeçalho */}
                    <View className="p-4">
                        <Text className="text-white text-xl font-bold">{reuniao.titulo}</Text>
                        {!!reuniao.descricao && (
                            <Text className="text-gray-400 mt-1">{reuniao.descricao}</Text>
                        )}
                    </View>

                    {/* Grade de participantes */}
                    <ParticipantGrid />

                    {/* Ações */}
                    <View className="flex-row justify-around p-4 bg-black/60">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-red-600 px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-medium">Sair da Sala</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                router.push({ pathname: '/camera', params: { reuniaoId: reuniao.id } })
                            }
                            className="bg-green-600 px-6 py-3 rounded-lg"
                        >
                            <Text className="text-white font-medium">Registrar Presença</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LiveKitRoom>
        </DeviceGuard>
    );
}

const ParticipantGrid: React.FC = () => {
    // Assina apenas vídeo de câmera (você pode adicionar ScreenShare se quiser)
    const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

    return (
        <View className="flex-1 flex-wrap flex-row p-2">
            {tracks.map((trackRef, idx) => (
                <View
                    key={idx}
                    className="w-1/2 aspect-square p-1"
                >
                    <ParticipantTile trackRef={trackRef} />
                </View>
            ))}

            {tracks.length === 0 && (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-white">Aguardando transmissão...</Text>
                </View>
            )}
        </View>
    );
};
