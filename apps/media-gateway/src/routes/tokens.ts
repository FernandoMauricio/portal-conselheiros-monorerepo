// apps/media-gateway/src/routes/tokens.ts
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { liveKitService } from '../services/livekit';
import { TrackSource } from '@livekit/protocol';

const router = Router();

const tokenSchema = z.object({
    roomName: z.string(),
    participantIdentity: z.string(),
    participantName: z.string().optional(),
    canPublish: z.boolean().default(false),
    canSubscribe: z.boolean().default(true),
    canPublishData: z.boolean().default(false),
    canPublishSources: z
        .array(z.enum(['camera', 'microphone', 'screen_share', 'screen_share_audio']))
        .optional(),
});

const sourceMap: Record<
    'camera' | 'microphone' | 'screen_share' | 'screen_share_audio',
    TrackSource
> = {
    camera: TrackSource.CAMERA,
    microphone: TrackSource.MICROPHONE,
    screen_share: TrackSource.SCREEN_SHARE,
    screen_share_audio: TrackSource.SCREEN_SHARE_AUDIO,
};

router.post('/generate', async (req: Request, res: Response) => {
    try {
        const {
            roomName,
            participantIdentity,
            participantName,
            canPublish,
            canSubscribe,
            canPublishData,
            canPublishSources,
        } = tokenSchema.parse(req.body);

        const mappedSources =
            canPublishSources?.map((s) => sourceMap[s]).filter(Boolean) as
            | TrackSource[]
            | undefined;

        const token = await liveKitService.generateToken({
            roomName,
            participantIdentity,
            participantName: participantName || participantIdentity,
            canPublish,
            canSubscribe,
            canPublishData,
            canPublishSources: mappedSources,
        });

        res.json({ token });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error('Error generating token:', error);
        res.status(500).json({ error: 'Failed to generate token' });
    }
});

export default router;
