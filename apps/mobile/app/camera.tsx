import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, PermissionsAndroid, Platform, Text, TouchableOpacity, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import {
    Camera,
    runAsync,
    useCameraDevice,
    useFrameProcessor,
    type Frame,
} from 'react-native-vision-camera';
import {
    useFaceDetector,
    type FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import { useAuth } from '../contexts/AuthContext';
import { verifyPresence } from '../services/faceRecognition';

export default function CameraScreen() {
    const cameraRef = useRef<Camera>(null);

    const faceDetectionOptions = useRef<FaceDetectionOptions>({
        performanceMode: 'fast',
        landmarkMode: 'none',
        contourMode: 'none',
        classificationMode: 'none',
        trackingEnabled: false,
    }).current;
    const { detectFaces, stopListeners } = useFaceDetector(faceDetectionOptions);

    const [hasPermission, setHasPermission] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Aguardando reconhecimento...');
    const [lottieSource, setLottieSource] = useState<any>(null);
    const [showLottie, setShowLottie] = useState(false);

    const processingGuard = useRef(false);
    const mounted = useRef(true);

    const { reuniaoId } = useLocalSearchParams<{ reuniaoId: string }>();
    const { deviceId } = useAuth();

    const frontCamera = useCameraDevice('front');

    useEffect(() => {
        mounted.current = true;
        (async () => {
            await Camera.requestCameraPermission();
            const status = await Camera.getCameraPermissionStatus();
            setHasPermission(status === 'granted');

            if (Platform.OS === 'android') {
                await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO).catch(() => { });
            }
        })();
        return () => { 
            stopListeners(); 
            mounted.current = false; 
        };
    }, [stopListeners]);

    const resetUI = useCallback(() => {
        if (!mounted.current) return;
        setShowLottie(false);
        setIsProcessing(false);
        setStatusMessage('Aguardando reconhecimento...');
        processingGuard.current = false;
    }, []);

    const onFaceDetected = useCallback(async () => {
        if (processingGuard.current || !mounted.current) return;
        processingGuard.current = true;
        setIsProcessing(true);
        setStatusMessage('Rosto detectado, verificando...');

        try {
            const camera = cameraRef.current;
            if (!camera) { resetUI(); return; }

            const photo = await camera.takePhoto(); // sem skipMetadata

            const result = await verifyPresence(photo.path, String(reuniaoId ?? ''), deviceId || '');

            if (!mounted.current) return;

            if (result?.success) {
                setStatusMessage(`Bem-vindo(a), ${result.conselheiro?.nome || ''}! Presença registrada.`);
                setLottieSource(require('../assets/success-animation.json'));
                setShowLottie(true);
                setTimeout(() => { if (mounted.current) router.back(); }, 2000);
            } else {
                setStatusMessage('Rosto não reconhecido. Tente novamente.');
                setLottieSource(require('../assets/error-animation.json'));
                setShowLottie(true);
                setTimeout(() => resetUI(), 1800);
            }
        } catch (e) {
            console.error('Erro ao processar reconhecimento facial:', e);
            if (!mounted.current) return;
            setStatusMessage('Erro no reconhecimento. Tente novamente.');
            setLottieSource(require('../assets/error-animation.json'));
            setShowLottie(true);
            setTimeout(() => resetUI(), 1800);
        }
    }, [deviceId, reuniaoId, resetUI]);

    const frameProcessor = useFrameProcessor((frame: Frame) => {
        'worklet';
        try {
            // opcional: rodar de forma assíncrona para não bloquear o preview
            // (recomendado pelo próprio guia do pacote)
            // runAsync vem da Vision Camera
            runAsync(frame, () => {
                'worklet';
                const faces = detectFaces(frame);
                if (faces && faces.length > 0) {
                    runOnJS(onFaceDetected)();
                }
            });
        } catch { }
    }, [onFaceDetected, detectFaces]);

    if (!frontCamera) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white text-lg">Câmera frontal não encontrada.</Text>
            </View>
        );
    }

    if (!hasPermission) {
        return (
            <View className="flex-1 justify-center items-center bg-black">
                <Text className="text-white text-lg mb-4">Permissão da câmera não concedida.</Text>
                <TouchableOpacity onPress={async () => {
                    await Camera.requestCameraPermission();
                    const st = await Camera.getCameraPermissionStatus();
                    setHasPermission(st === 'granted');
                }}>
                    <Text className="text-blue-500">Conceder Permissão</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <Camera
                ref={cameraRef}
                style={{ flex: 1 }}
                device={frontCamera}
                isActive={true}
                photo={true}
                frameProcessor={frameProcessor}
            />

            <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 items-center">
                <Text className="text-white text-xl font-bold">{statusMessage}</Text>
                {isProcessing && !showLottie && (<ActivityIndicator size="small" color="#00BFFF" style={{ marginTop: 8 }} />)}
            </View>

            {showLottie && lottieSource && (
                <View className="absolute inset-0 justify-center items-center bg-black/70">
                    <LottieView source={lottieSource} autoPlay loop={false} style={{ width: 200, height: 200 }} />
                </View>
            )}
        </View>
    );
}
