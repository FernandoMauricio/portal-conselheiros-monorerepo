import { Router } from 'express';
import { liveKitService } from '../services/livekit';
import { z } from 'zod';

const router = Router();

const tokenSchema = z.object({
  roomName: z.string(),
  participantIdentity: z.string(),
  participantName: z.string().optional(),
  canPublish: z.boolean().default(false),
  canSubscribe: z.boolean().default(true),
  canPublishData: z.boolean().default(false),
  canPublishSources: z.array(z.enum(["camera", "microphone", "screen_share", "screen_share_audio"])).optional(),
});

router.post('/generate', async (req, res) => {
  try {
    const { roomName, participantIdentity, participantName, canPublish, canSubscribe, canPublishData, canPublishSources } = tokenSchema.parse(req.body);

    const token = await liveKitService.generateToken(
      roomName,
      participantIdentity,
      participantName || participantIdentity,
      canPublish,
      canSubscribe,
      canPublishData,
      canPublishSources
    );
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

