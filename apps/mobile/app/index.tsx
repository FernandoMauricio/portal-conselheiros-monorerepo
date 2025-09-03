// app/index.tsx
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function IndexScreen() {
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                router.replace('/(tabs)/reunioes' as any);
            } else {
                router.replace('/login' as any);
            }
        }
    }, [isAuthenticated, loading]);

    // um mini loading enquanto decide
    return (
        <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" />
        </View>
    );
}
