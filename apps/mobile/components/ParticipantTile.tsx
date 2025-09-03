// app/components/ParticipantTile.tsx
import { VideoTrack } from '@livekit/react-native';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

type Props = {
    trackRef: any; // TrackReference de @livekit/react-native
};

export default function ParticipantTile({ trackRef }: Props) {
    const name = useMemo(() => {
        const p = trackRef?.participant;
        return p?.name || p?.identity || 'Participante';
    }, [trackRef]);

    const quality = trackRef?.participant?.connectionQuality; // 'excellent' | 'good' | 'poor' | 'lost' | 'unknown'
    const isSpeaking = !!trackRef?.participant?.isSpeaking;

    const qualityColor =
        quality === 'excellent' ? '#22c55e' :
            quality === 'good' ? '#a3e635' :
                quality === 'poor' ? '#f59e0b' :
                    quality === 'lost' ? '#ef4444' :
                        '#9ca3af';

    return (
        <View className="w-full h-full rounded-xl overflow-hidden bg-black/40">
            <View style={{ flex: 1 }}>
                <VideoTrack trackRef={trackRef} />
            </View>

            {/* overlay inferior */}
            <View className="absolute left-0 right-0 bottom-0 p-2 bg-black/60">
                <View className="flex-row items-center justify-between">
                    <Text className="text-white font-semibold" numberOfLines={1}>
                        {name}
                    </Text>
                    <View className="flex-row items-center gap-x-2">
                        {/* speaking dot */}
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 999,
                                backgroundColor: isSpeaking ? '#22c55e' : '#6b7280',
                            }}
                        />
                        {/* connection quality */}
                        <View className="flex-row gap-x-0.5">
                            {[0, 1, 2].map((i) => (
                                <View
                                    key={i}
                                    style={{
                                        width: 4,
                                        height: (i + 1) * 4,
                                        backgroundColor: qualityColor,
                                        opacity: 0.9,
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
