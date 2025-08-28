// apps/media-gateway/src/services/livekit.ts
import {
    RoomServiceClient,
    AccessToken,
    type CreateOptions,
    EgressClient,
    EncodedFileType,
    EncodingOptionsPreset,
    EncodedFileOutput,
} from 'livekit-server-sdk';
import { TrackSource } from '@livekit/protocol';
import dotenv from 'dotenv';

dotenv.config();

// Use HTTP/HTTPS para o server SDK (ws:// é para o client)
const livekitHost = process.env.LIVEKIT_HOST || 'http://localhost:7880';
const livekitApiKey = process.env.LIVEKIT_API_KEY || 'devkey';
const livekitApiSecret = process.env.LIVEKIT_API_SECRET || 'secret';

export const roomService = new RoomServiceClient(livekitHost, livekitApiKey, livekitApiSecret);
export const egressClient = new EgressClient(livekitHost, livekitApiKey, livekitApiSecret);

class LiveKitService {
    async createRoom(roomName: string, options?: Partial<CreateOptions>) {
        const opts: CreateOptions = {
            name: roomName,
            emptyTimeout: 60 * 10,
            maxParticipants: 20,
            ...options,
        };

        try {
            const room = await roomService.createRoom(opts);
            console.log(`Room created: ${room.name}`);
            return room;
        } catch (error: any) {
            // Se já existe, ignore; caso contrário, propague
            if (!/already exists/i.test(error?.message || '')) {
                console.error(`Error creating room ${roomName}:`, error);
                throw error;
            }
            const rooms = await roomService.listRooms();
            return rooms.find((r) => r.name === roomName);
        }
    }

    async deleteRoom(roomName: string): Promise<void> {
        await roomService.deleteRoom(roomName);
        console.log(`Room deleted: ${roomName}`);
    }

    async listRooms() {
        return roomService.listRooms();
    }

    /**
     * Gera um token de acesso para um participante.
     * canPublishSources usa enum TrackSource (do @livekit/protocol).
     */
    async generateToken(params: {
        roomName: string;
        participantIdentity: string;
        participantName?: string;
        canPublish?: boolean;
        canSubscribe?: boolean;
        canPublishData?: boolean;
        canPublishSources?: TrackSource[];
    }): Promise<string> {
        const {
            roomName,
            participantIdentity,
            participantName,
            canPublish = true,
            canSubscribe = true,
            canPublishData = true,
            canPublishSources,
        } = params;

        const at = new AccessToken(livekitApiKey, livekitApiSecret, {
            identity: participantIdentity,
            name: participantName,
        });

        at.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish,
            canSubscribe,
            canPublishData,
            canPublishSources, // ← agora é TrackSource[]
        });

        return at.toJwt();
    }

    /**
     * Inicia egress composto (MP4) com preset H264_1080P_30.
     * O caminho precisa ser acessível pelo processo de egress (container).
     */
    async startRoomCompositeEgress(roomName: string, filename: string): Promise<string> {
        const outputPath = process.env.RECORDING_OUTPUT_PATH || './recordings';

        // EncodedFileOutput é classe: instancie com "new"
        const output = new EncodedFileOutput({
            fileType: EncodedFileType.MP4,
            filepath: `${outputPath}/${filename}.mp4`,
        });

        const info = await egressClient.startRoomCompositeEgress(
            roomName,
            output,
            "grid",
            EncodingOptionsPreset.H264_1080P_30,
        );

        console.log(`Started room composite egress for room ${roomName}: ${info.egressId}`);
        return info.egressId;
    }

    async stopEgress(egressId: string): Promise<void> {
        await egressClient.stopEgress(egressId);
        console.log(`Stopped egress: ${egressId}`);
    }
}

export const liveKitService = new LiveKitService();
