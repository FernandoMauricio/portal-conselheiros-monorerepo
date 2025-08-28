import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Carregando..." }) => {
  return (
    <View className="flex-1 justify-center items-center bg-gray-900">
      <ActivityIndicator size="large" color="#00BFFF" />
      <Text className="text-white mt-4 text-lg">{message}</Text>
    </View>
  );
};

export default LoadingSpinner;

