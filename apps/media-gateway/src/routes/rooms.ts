import { Router } from 'express';
import { liveKitService } from '../services/livekit';

const router = Router();

router.post('/create', async (req, res) => {
  const { roomName, options } = req.body;
  if (!roomName) {
    return res.status(400).json({ error: 'roomName is required' });
  }
  try {
    const room = await liveKitService.createRoom(roomName, options);
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.post('/delete', async (req, res) => {
  const { roomName } = req.body;
  if (!roomName) {
    return res.status(400).json({ error: 'roomName is required' });
  }
  try {
    await liveKitService.deleteRoom(roomName);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const rooms = await liveKitService.listRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

export default router;

