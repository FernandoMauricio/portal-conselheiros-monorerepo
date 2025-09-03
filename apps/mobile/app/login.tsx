import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
    const { isAuthenticated, login, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)/home');
        }
    }, [isAuthenticated]);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha e-mail e senha.');
            return;
        }
        setSubmitting(true);
        try {
            await login(email.trim(), password);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 justify-center items-center p-6 bg-black">
            <View className="w-full max-w-md">
                <Text className="text-2xl font-bold text-white mb-6 text-center">Portal dos Conselheiros</Text>
                <TextInput
                    placeholder="E-mail"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    className="w-full bg-gray-800 text-white p-4 rounded-md mb-4"
                />
                <TextInput
                    placeholder="Senha"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    className="w-full bg-gray-800 text-white p-4 rounded-md mb-4"
                />
                {error && <Text className="text-red-500 text-center mb-2">{error}</Text>}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting || loading}
                    className="w-full bg-blue-600 p-4 rounded-md items-center"
                >
                    {submitting || loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">Entrar</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}
