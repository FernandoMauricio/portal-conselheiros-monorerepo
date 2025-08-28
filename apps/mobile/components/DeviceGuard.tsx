import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as Application from "expo-application";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface DeviceGuardProps {
  children: React.ReactNode;
}

const DeviceGuard: React.FC<DeviceGuardProps> = ({ children }) => {
  const { deviceId, isDeviceAuthorized, loading, error } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verificando dispositivo..." />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-red-900 p-4">
        <Text className="text-white text-xl font-bold text-center">Erro de Dispositivo</Text>
        <Text className="text-red-200 text-lg text-center mt-2">{error}</Text>
        <Text className="text-red-200 text-base text-center mt-4">Por favor, entre em contato com o suporte técnico.</Text>
      </View>
    );
  }

  if (!isDeviceAuthorized) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 p-4">
        <Text className="text-white text-2xl font-bold mb-4 text-center">Dispositivo Não Autorizado</Text>
        <Text className="text-gray-300 text-lg text-center">Este dispositivo (ID: {deviceId || "N/A"}) não está autorizado a acessar o sistema.</Text>
        <Text className="text-gray-300 text-base text-center mt-4">Por favor, entre em contato com o administrador para autorização.</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default DeviceGuard;

