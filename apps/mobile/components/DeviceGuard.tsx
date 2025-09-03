import React from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const DeviceGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { deviceId } = useAuth();

    if (!deviceId) {
        return (
            <View className="flex-1 justify-center items-center bg-black p-6">
                <Text className="text-white">Dispositivo não identificado.</Text>
            </View>
        );
    }
    return <>{children}</>;
};

export default DeviceGuard;
