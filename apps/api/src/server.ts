import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import conselheirosRoutes from './routes/conselheiros';
import reunioesRoutes from './routes/reunioes';
import streamRoutes from './routes/stream';
import devicesRoutes from './routes/devices';
import exportRoutes from './routes/export';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conselheiros', conselheirosRoutes);
app.use('/api/reunioes', reunioesRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL database');
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

main();


