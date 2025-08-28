import { Router } from 'express';
import { liveKitService } from '../services/livekit';
import { z } from 'zod';

const router = Router();

const startEgressSchema = z.object({
  roomName: z.string(),
  filename: z.string().optional(),
});

const stopEgressSchema = z.object({
  egressId: z.string(),
});

router.post('/start', async (req, res) => {
  try {
    const { roomName, filename } = startEgressSchema.parse(req.body);
    const egressId = await liveKitService.startRoomCompositeEgress(roomName, filename || `recording-${roomName}-${Date.now()}`);
    res.json({ egressId });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error starting egress:', error);
    res.status(500).json({ error: 'Failed to start egress' });
  }
});

router.post('/stop', async (req, res) => {
  try {
    const { egressId } = stopEgressSchema.parse(req.body);
    await liveKitService.stopEgress(egressId);
    res.json({ message: 'Egress stopped successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error stopping egress:', error);
    res.status(500).json({ error: 'Failed to stop egress' });
  }
});

export default router;

