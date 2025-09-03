import * as Device from 'expo-device';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    deviceId: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Gera/pega um deviceId simples (pode trocar por algo mais robusto)
        const id = `${Device.manufacturer || 'device'}-${Device.modelId || 'model'}-${Device.osInternalBuildId || Date.now()}`;
        setDeviceId(id);
        // restaura sessão se tiver token guardado (AsyncStorage, etc.)
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            // Ex.: guardar tokens se existirem
            // await AsyncStorage.setItem('token', res.data.accessToken);
            setIsAuthenticated(true);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Credenciais inválidas.');
            setIsAuthenticated(false);
            throw e;
        }
    };

    const logout = () => {
        // limpar tokens etc.
        setIsAuthenticated(false);
    };

    const value = useMemo(() => ({
        isAuthenticated, loading, error, deviceId, login, logout,
    }), [isAuthenticated, loading, error, deviceId]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
