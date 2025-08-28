import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LiveKitRoom, VideoConference, useRoomContext, useTracks, useLocalParticipant, useRemoteParticipants } from "@livekit/react-native";
import { Track, TrackPublication, RemoteParticipant, LocalParticipant } from "livekit-client";
import { useAuth } from "../../contexts/AuthContext";
import { generateLiveKitToken } from "../../services/stream";
import { getReuniaoById } from "../../services/api";
import { Reuniao } from "../../types";

interface CustomParticipantViewProps {
  participant: LocalParticipant | RemoteParticipant;
  trackPublication?: TrackPublication;
}

const CustomParticipantView: React.FC<CustomParticipantViewProps> = ({ participant, trackPublication }) => {
  const videoTrack = trackPublication?.track;

  if (!videoTrack || videoTrack.isMuted) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-800 rounded-lg">
        <Text className="text-white text-lg">{participant.identity}</Text>
        <Text className="text-gray-400">Vídeo Desligado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black rounded-lg overflow-hidden">
      {/* LiveKitVideo is a native component, ensure it renders correctly */}
      {/* <LiveKitVideo
        track={videoTrack}
        style={{ flex: 1 }}
        objectFit="contain"
      /> */}
      <Text className="absolute bottom-2 left-2 text-white bg-black px-2 py-1 rounded-md text-xs">
        {participant.identity}
      </Text>
    </View>
  );
};

export default function SalaScreen() {
  const { reuniaoId } = useLocalSearchParams();
  const { deviceId } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reuniao, setReuniao] = useState<Reuniao | null>(null);

  useEffect(() => {
    const fetchReuniaoAndToken = async () => {
      if (!reuniaoId || !deviceId) {
        setError("ID da reunião ou do dispositivo ausente.");
        setLoading(false);
        return;
      }

      try {
        const fetchedReuniao = await getReuniaoById(reuniaoId as string);
        setReuniao(fetchedReuniao);

        if (!fetchedReuniao.streamRoomId) {
          setError("Esta reunião não possui uma sala de transmissão configurada.");
          setLoading(false);
          return;
        }

        const liveKitToken = await generateLiveKitToken(
          fetchedReuniao.streamRoomId,
          deviceId as string,
          `tablet-${deviceId}`,
          false, // canPublish
          true,  // canSubscribe
          true   // canPublishData
        );
        setToken(liveKitToken);
      } catch (err: any) {
        console.error("Erro ao buscar reunião ou gerar token:", err);
        setError(err.message || "Erro ao carregar a sala de transmissão.");
      } finally {
        setLoading(false);
      }
    };

    fetchReuniaoAndToken();
  }, [reuniaoId, deviceId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text className="text-white mt-4 text-lg">Carregando sala...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 p-4">
        <Text className="text-red-500 text-xl font-bold text-center">Erro ao carregar a sala:</Text>
        <Text className="text-red-300 text-lg text-center mt-2">{error}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-blue-600 px-6 py-3 rounded-lg">
          <Text className="text-white text-lg">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!token || !reuniao) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-lg">Token ou dados da reunião não disponíveis.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <LiveKitRoom
        url={process.env.EXPO_PUBLIC_MEDIA_URL?.replace("http", "ws") || "ws://localhost:7880"} // LiveKit WS URL
        token={token}
        connect={true}
        audio={true}
        video={false} // Mobile app is viewer only, no video publishing
        onConnected={() => console.log("Conectado à sala LiveKit!")}
        onDisconnected={() => console.log("Desconectado da sala LiveKit.")}
        onError={(e) => console.error("Erro LiveKit:", e)}
      >
        <View className="flex-1 p-4">
          <Text className="text-white text-3xl font-bold mb-4">{reuniao.titulo}</Text>
          <Text className="text-gray-400 text-lg mb-6">{reuniao.descricao}</Text>

          <VideoConference />

          {/* Custom Participant Grid (example) */}
          <ParticipantGrid />

          <View className="mt-auto flex-row justify-around items-center p-4 bg-gray-800 rounded-lg">
            <TouchableOpacity onPress={() => router.back()} className="bg-red-600 px-6 py-3 rounded-lg">
              <Text className="text-white text-lg">Sair da Sala</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: "/camera", params: { reuniaoId: reuniao.id } })} className="bg-green-600 px-6 py-3 rounded-lg">
              <Text className="text-white text-lg">Registrar Presença</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LiveKitRoom>
    </View>
  );
}

const ParticipantGrid: React.FC = () => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  const allParticipants = [localParticipant, ...remoteParticipants];

  const tracks = useTracks(
    [{ source: Track.Source.Camera, with  : Track.Source.Microphone }],
    { onlySubscribed: false }
  );

  const videoTracks = tracks.filter(trackRef => trackRef.publication.kind === Track.Kind.Video);

  return (
    <View className="flex-1 grid grid-cols-2 gap-4 mb-4">
      {videoTracks.map((trackRef) => (
        <CustomParticipantView
          key={trackRef.publication.trackSid}
          participant={trackRef.participant}
          trackPublication={trackRef.publication}
        />
      ))}
      {videoTracks.length === 0 && (
        <View className="col-span-2 flex-1 justify-center items-center bg-gray-800 rounded-lg">
          <Text className="text-white text-xl">Aguardando transmissão...</Text>
        </View>
      )}
    </View>
  );
};

