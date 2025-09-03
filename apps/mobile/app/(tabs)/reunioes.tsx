// app/(tabs)/reunioes.tsx
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type Reuniao = {
    id: string;
    titulo: string;
    descricao?: string | null;
    data?: string | null; // ISO
    local?: string | null;
    status?: string | null;
    streamRoomId?: string | null;
};

export default function ReunioesTab() {
    const { token } = useAuth() as any; // ajuste se seu AuthContext expõe outro nome
    const API: string | undefined = useMemo(
        () =>
            (Constants.expoConfig?.extra as any)?.apiUrl ||
            (Constants.manifest as any)?.extra?.apiUrl ||
            process.env.EXPO_PUBLIC_API_URL,
        []
    );

    const [items, setItems] = useState<Reuniao[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const headers: Record<string, string> = useMemo(() => {
        const h: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) h.Authorization = `Bearer ${token}`;
        return h;
    }, [token]);

    const fetchReunioes = useCallback(async () => {
        if (!API) {
            setError('URL da API não configurada.');
            setLoading(false);
            return;
        }
        try {
            setError(null);
            const res = await fetch(`${API}/reunioes`, { headers });
            if (!res.ok) {
                const msg = await safeText(res);
                throw new Error(`Falha ao carregar reuniões (${res.status}): ${msg || 'erro desconhecido'}`);
            }
            const json = await res.json();
            setItems(Array.isArray(json) ? json : []);
        } catch (e: any) {
            console.error('Erro ao carregar reuniões', e);
            setError(e?.message ?? 'Erro ao carregar reuniões.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [API, headers]);

    useEffect(() => {
        fetchReunioes();
    }, [fetchReunioes]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReunioes();
    }, [fetchReunioes]);

    const criarDemo = useCallback(async () => {
        if (!API) return;
        try {
            const body = {
                // sua API espera data como STRING contendo JSON
                data: JSON.stringify({
                    titulo: 'Reunião Demo',
                    descricao: 'Simulação do Portal',
                    data: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // +5 min
                    local: 'Sala Principal',
                    status: 'AGENDADA',
                    streamRoomId: 'demo-room-01',
                }),
            };
            const res = await fetch(`${API}/reunioes`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const msg = await safeText(res);
                throw new Error(`Falha ao criar demo (${res.status}): ${msg || 'erro desconhecido'}`);
            }
            await fetchReunioes();
            Alert.alert('OK', 'Reunião demo criada.');
        } catch (e: any) {
            console.error('Erro ao criar demo', e);
            Alert.alert('Erro', e?.message ?? 'Não foi possível criar a demo.');
        }
    }, [API, headers, fetchReunioes]);

    if (loading) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <ActivityIndicator color="#fff" />
                <Text className="text-white mt-3">Carregando reuniões...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-black items-center justify-center p-6">
                <Text className="text-red-400 text-center">{error}</Text>
                <TouchableOpacity
                    onPress={fetchReunioes}
                    className="mt-4 bg-blue-600 px-5 py-3 rounded-xl"
                >
                    <Text className="text-white">Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <View className="px-4 pt-4 pb-2">
                <Text className="text-white text-2xl font-bold">Reuniões</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(it) => it.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                }
                ItemSeparatorComponent={() => <View className="h-3" />}
                contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
                ListEmptyComponent={
                    <View className="flex-1 items-center mt-10">
                        <Text className="text-zinc-400 mb-4">Nenhuma reunião encontrada.</Text>
                        <TouchableOpacity
                            className="bg-green-600 px-5 py-3 rounded-xl"
                            onPress={criarDemo}
                        >
                            <Text className="text-white">Criar reunião demo</Text>
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item }) => {
                    const dt = item.data ? new Date(item.data) : null;
                    const quando = dt
                        ? dt.toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                        })
                        : '—';
                    const temSala = !!item.streamRoomId;

                    return (
                        <View className="bg-zinc-900 rounded-xl p-4">
                            <Text className="text-white text-lg font-semibold">{item.titulo}</Text>
                            {!!item.descricao && (
                                <Text className="text-zinc-300 mt-1">{item.descricao}</Text>
                            )}
                            <View className="flex-row justify-between items-center mt-3">
                                <Text className="text-zinc-400">Quando: {quando}</Text>
                                <View
                                    className={`px-2 py-1 rounded ${temSala ? 'bg-emerald-700' : 'bg-zinc-700'
                                        }`}
                                >
                                    <Text className="text-white text-xs">
                                        {temSala ? `Sala: ${item.streamRoomId}` : 'Sem sala'}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3 mt-4">
                                <TouchableOpacity
                                    disabled={!temSala}
                                    onPress={() =>
                                        router.push({ pathname: '/sala', params: { reuniaoId: item.id } } as any)
                                    }
                                    className={`px-4 py-3 rounded-lg ${temSala ? 'bg-blue-600' : 'bg-zinc-700'
                                        }`}
                                >
                                    <Text className="text-white">
                                        {temSala ? 'Entrar na sala' : 'Sala não configurada'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

async function safeText(res: Response) {
    try {
        return await res.text();
    } catch {
        return '';
    }
}
