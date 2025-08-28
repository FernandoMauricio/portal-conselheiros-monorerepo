import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const deviceSchema = z.object({
  deviceId: z.string().min(3).max(255),
  modelo: z.string().optional(),
  autorizado: z.boolean().optional(),
  ownerUserId: z.string().uuid().optional(),
});

// Get all devices
router.get('/', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: { owner: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(devices);
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Get device by ID
router.get('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const device = await prisma.device.findUnique({
      where: { id },
      include: { owner: { select: { id: true, email: true } } },
    });
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo não encontrado' });
    }
    res.json(device);
  } catch (error) {
    console.error('Erro ao buscar dispositivo por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Create a new device
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const data = deviceSchema.parse(req.body);
    const device = await prisma.device.create({ data });
    res.status(201).json(device);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao criar dispositivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Update a device
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    const data = deviceSchema.partial().parse(req.body);
    const device = await prisma.device.update({
      where: { id },
      data,
    });
    res.json(device);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar dispositivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Delete a device
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.device.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar dispositivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Authorize a device by deviceId
router.patch('/authorize', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const { deviceId, autorizado } = z.object({
      deviceId: z.string(),
      autorizado: z.boolean(),
    }).parse(req.body);

    const device = await prisma.device.update({
      where: { deviceId: deviceId },
      data: { autorizado: autorizado, ownerUserId: req.user?.id },
    });
    res.json(device);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao autorizar dispositivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;

