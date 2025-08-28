import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import DeviceGuard from "../../components/DeviceGuard";
import { useAuth } from "../../contexts/AuthContext";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      // Simulate async check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      if (isAuthenticated) {
        router.replace("/sala"); // Or appropriate authenticated route
      } else {
        // Handle unauthenticated state, e.g., show a login screen or device authorization
      }
    };
    checkAuth();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text className="text-white mt-4 text-lg">Carregando...</Text>
      </View>
    );
  }

  return (
    <DeviceGuard>
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-2xl font-bold mb-4">Bem-vindo ao Portal dos Conselheiros</Text>
        <Text className="text-gray-300 text-lg">Aguardando autorização do dispositivo...</Text>
        {/* Optionally add a button to retry or contact support */}
      </View>
    </DeviceGuard>
  );
}

