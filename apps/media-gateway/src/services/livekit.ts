import { RoomServiceClient, AccessToken, Room, RoomCreateOptions, EgressClient, EncodedFileType, SegmentedFileProtocol, SegmentedFilePreset, DirectFileOutput, DirectFileOutputEncodingOptions } from 'livekit-server-sdk';
import { TrackSource } from 'livekit-client';
import dotenv from 'dotenv';

dotenv.config();

const livekitHost = process.env.LIVEKIT_WS_URL || 'ws://localhost:7880';
const livekitApiKey = process.env.LIVEKIT_API_KEY || 'devkey';
const livekitApiSecret = process.env.LIVEKIT_API_SECRET || 'secret';

export const roomService = new RoomServiceClient(
  livekitHost,
  livekitApiKey,
  livekitApiSecret
);

export const egressClient = new EgressClient(livekitHost, livekitApiKey, livekitApiSecret);

class LiveKitService {
  async createRoom(roomName: string, options?: RoomCreateOptions): Promise<Room> {
    try {
      const room = await roomService.createRoom({
        name: roomName,
        emptyTimeout: 60 * 10, // 10 minutes
        maxParticipants: 20,
        ...options,
      });
      console.log(`Room created: ${room.name}`);
      return room;
    } catch (error) {
      console.error(`Error creating room ${roomName}:`, error);
      throw error;
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await roomService.deleteRoom(roomName);
      console.log(`Room deleted: ${roomName}`);
    } catch (error) {
      console.error(`Error deleting room ${roomName}:`, error);
      throw error;
    }
  }

  async listRooms(): Promise<Room[]> {
    try {
      const rooms = await roomService.listRooms();
      return rooms;
    } catch (error) {
      console.error('Error listing rooms:', error);
      throw error;
    }
  }

  async generateToken(roomName: string, participantIdentity: string, participantName: string, canPublish: boolean, canSubscribe: boolean, canPublishData: boolean, canPublishSources?: TrackSource[]): Promise<string> {
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
      canPublishSources,
    });

    return at.toJwt();
  }

  async startRoomCompositeEgress(roomName: string, filename: string): Promise<string> {
    const output = new DirectFileOutput({
      filepath: `${process.env.RECORDING_OUTPUT_PATH || './recordings'}/${filename}.mp4`,
      outputFileType: EncodedFileType.MP4,
    });

    const encodingOptions = new DirectFileOutputEncodingOptions({
      audioBitrate: 128,
      videoBitrate: 2000,
      width: 1280,
      height: 720,
      depth: 24,
      framerate: 30,
    });

    const info = await egressClient.startRoomCompositeEgress(roomName, output, encodingOptions);
    console.log(`Started room composite egress for room ${roomName}: ${info.egressId}`);
    return info.egressId;
  }

  async stopEgress(egressId: string): Promise<void> {
    await egressClient.stopEgress(egressId);
    console.log(`Stopped egress: ${egressId}`);
  }
}

export const liveKitService = new LiveKitService();


