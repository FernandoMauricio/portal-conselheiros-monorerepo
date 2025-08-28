import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import { faceDetector } from "vision-camera-face-detector";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { verifyPresence } from "../../services/faceRecognition";
import LottieView from "lottie-react-native";

interface Face {
  bounds: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  rollAngle: number;
  yawAngle: number;
  smilingProbability?: number;
  leftEarPosition?: { x: number; y: number };
  rightEarPosition?: { x: number; y: number };
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  leftEyePosition?: { x: number; y: number };
  rightEyePosition?: { x: number; y: number };
  noseBasePosition?: { x: number; y: number };
  mouthLeftPosition?: { x: number; y: number };
  mouthRightPosition?: { x: number; y: number };
  mouthBottomPosition?: { x: number; y: number };
}

export default function CameraScreen() {
  const devices = useCameraDevices();
  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Aguardando reconhecimento...");
  const [lottieSource, setLottieSource] = useState<any>(null);
  const [showLottie, setShowLottie] = useState(false);

  const { reuniaoId } = useLocalSearchParams();
  const { deviceId } = useAuth();

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "authorized");
    })();
  }, []);

  const handleFacesDetected = async ({ faces }: { faces: Face[] }) => {
    if (isProcessing || faces.length === 0) return;

    setIsProcessing(true);
    setStatusMessage("Rosto detectado, verificando...");

    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          qualityPrioritization: "speed",
          skipMetadata: true,
        });

        const result = await verifyPresence(photo.path, reuniaoId as string, deviceId);

        if (result.success) {
          setStatusMessage(`Bem-vindo(a), ${result.conselheiro.nome}! Presença registrada.`);
          setLottieSource(require("../../assets/success-animation.json"));
          setShowLottie(true);
          setTimeout(() => {
            setShowLottie(false);
            router.back(); // Go back to previous screen or navigate to another
          }, 3000);
        } else {
          setStatusMessage("Rosto não reconhecido. Tente novamente.");
          setLottieSource(require("../../assets/error-animation.json"));
          setShowLottie(true);
          setTimeout(() => {
            setShowLottie(false);
            setIsProcessing(false);
            setStatusMessage("Aguardando reconhecimento...");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Erro ao processar reconhecimento facial:", error);
      setStatusMessage("Erro no reconhecimento. Tente novamente.");
      setLottieSource(require("../../assets/error-animation.json"));
      setShowLottie(true);
      setTimeout(() => {
        setShowLottie(false);
        setIsProcessing(false);
        setStatusMessage("Aguardando reconhecimento...");
      }, 3000);
    }
  };

  if (!devices.front) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-lg">Câmera frontal não encontrada.</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-lg">Permissão da câmera não concedida.</Text>
        <TouchableOpacity onPress={() => Camera.requestCameraPermission()}>
          <Text className="text-blue-500 mt-4">Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={devices.front}
        isActive={true}
        photo={true}
        faceDetector={faceDetector}
        onFacesDetected={handleFacesDetected}
        faceDetectionCallbackRate={1000} // Detect faces every 1 second
      />
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 items-center">
        <Text className="text-white text-xl font-bold">{statusMessage}</Text>
        {isProcessing && !showLottie && <ActivityIndicator size="small" color="#00BFFF" className="mt-2" />}
      </View>
      {showLottie && lottieSource && (
        <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-70">
          <LottieView
            source={lottieSource}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>
      )}
    </View>
  );
}

