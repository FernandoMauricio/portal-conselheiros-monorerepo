import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomServiceClient, AccessToken, Room } from 'livekit-server-sdk';
import roomRoutes from './routes/rooms';
import tokenRoutes from './routes/tokens';
import webhookRoutes from './routes/webhooks';
import egressRoutes from './routes/egress';

dotenv.config();

const app = express();

// LiveKit configuration
const livekitHost = process.env.LIVEKIT_WS_URL || 'ws://localhost:7880';
const livekitApiKey = process.env.LIVEKIT_API_KEY || 'devkey';
const livekitApiSecret = process.env.LIVEKIT_API_SECRET || 'secret';

export const roomService = new RoomServiceClient(
  livekitHost,
  livekitApiKey,
  livekitApiSecret
);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/egress', egressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Media Gateway is healthy' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Media Gateway server running on port ${PORT}`);
});


