import 'dotenv/config';
import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Portal dos Conselheiros',
    slug: 'portal-conselheiros-mobile',
    scheme: 'portalconselheiros',
    version: '1.0.0',
    orientation: 'landscape',
    icon: './assets/images/icon.png',
    splash: { image: './assets/images/splash-icon.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
    userInterfaceStyle: 'automatic',
    platforms: ['android'],

    extra: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL,
        mediaUrl: process.env.EXPO_PUBLIC_MEDIA_URL,
        livekitWsUrl: process.env.EXPO_PUBLIC_LIVEKIT_WS_URL,
        eas: { projectId: '97fa7042-2056-46ae-b871-c7ae87cbff33' },
    },

    android: {
        package: 'com.fernandomauricio.portalconselheirosmobile',
        versionCode: 1,
        permissions: [
            'INTERNET',
            'android.permission.CAMERA',
            'android.permission.RECORD_AUDIO',
            'android.permission.MODIFY_AUDIO_SETTINGS',
            'android.permission.WAKE_LOCK'
        ],
        adaptiveIcon: { foregroundImage: './assets/images/adaptive-icon.png', backgroundColor: '#ffffff' },
        allowBackup: false,
    },

    plugins: [
        ['expo-build-properties', {
            android: {
                compileSdkVersion: 35,
                targetSdkVersion: 35,
                minSdkVersion: 26,
            }
        }],
        '@livekit/react-native-expo-plugin',
        '@config-plugins/react-native-webrtc',
        'react-native-vision-camera',
    ],

    experiments: {
        typedRoutes: true,
    },
});
