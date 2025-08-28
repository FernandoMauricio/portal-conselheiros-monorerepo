import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const streamSessionSchema = z.object({
  reuniaoId: z.string().uuid(),
  roomName: z.string().min(3),
  status: z.enum(['CREATED', 'ACTIVE', 'ENDED', 'ERROR']).optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  participantCount: z.number().int().min(0).optional(),
  recordingId: z.string().optional(),
});

// Get all stream sessions
router.get('/', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER, UserRole.VIEWER), async (req, res) => {
  try {
    const sessions = await prisma.streamSession.findMany({
      include: { reuniao: true },
      orderBy: { startedAt: 'desc' },
    });
    res.json(sessions);
  } catch (error) {
    console.error('Erro ao buscar sessões de stream:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Get stream session by ID
router.get('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER, UserRole.VIEWER), async (req, res) => {
  try {
    const { id } = req.params;
    const session = await prisma.streamSession.findUnique({
      where: { id },
      include: { reuniao: true },
    });
    if (!session) {
      return res.status(404).json({ message: 'Sessão de stream não encontrada' });
    }
    res.json(session);
  } catch (error) {
    console.error('Erro ao buscar sessão de stream por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Create a new stream session
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.PRESENTER), async (req, res) => {
  try {
    const data = streamSessionSchema.parse(req.body);
    const session = await prisma.streamSession.create({ data });
    res.status(201).json(session);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao criar sessão de stream:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Update a stream session
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.PRESENTER), async (req, res) => {
  try {
    const { id } = req.params;
    const data = streamSessionSchema.partial().parse(req.body);
    const session = await prisma.streamSession.update({
      where: { id },
      data,
    });
    res.json(session);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar sessão de stream:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Delete a stream session
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.streamSession.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar sessão de stream:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;

