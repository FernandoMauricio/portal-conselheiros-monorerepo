import { Router } from 'express';
import { PrismaClient, UserRole, ReuniaoStatus } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const reuniaoSchema = z.object({
  titulo: z.string().min(3).max(255),
  descricao: z.string().optional(),
  data: z.string().datetime(), // ISO 8601 string
  local: z.string().optional(),
  status: z.nativeEnum(ReuniaoStatus).default(ReuniaoStatus.AGENDADA).optional(),
  createdBy: z.string().uuid().optional(),
});

const presencaSchema = z.object({
  conselheiroId: z.string().uuid(),
  presente: z.boolean(),
  horarioChegada: z.string().datetime().optional(),
  metodoRegistro: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  deviceId: z.string().optional(),
});

// Get all reunioes
router.get('/', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER, UserRole.VIEWER), async (req, res) => {
  try {
    const reunioes = await prisma.reuniao.findMany({
      orderBy: { data: 'desc' },
      include: {
        criador: { select: { id: true, email: true } },
        presencas: { include: { conselheiro: true } },
        streamSession: true,
      },
    });
    res.json(reunioes);
  } catch (error) {
    console.error('Erro ao buscar reuniões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Get reuniao by ID
router.get('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER, UserRole.VIEWER), async (req, res) => {
  try {
    const { id } = req.params;
    const reuniao = await prisma.reuniao.findUnique({
      where: { id },
      include: {
        criador: { select: { id: true, email: true } },
        presencas: { include: { conselheiro: true } },
        streamSession: true,
      },
    });
    if (!reuniao) {
      return res.status(404).json({ message: 'Reunião não encontrada' });
    }
    res.json(reuniao);
  } catch (error) {
    console.error('Erro ao buscar reunião por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Create a new reuniao
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR), async (req, res) => {
  try {
    const data = reuniaoSchema.parse(req.body);
    const reuniao = await prisma.reuniao.create({ data: { ...data, createdBy: req.user?.id } });
    res.status(201).json(reuniao);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao criar reunião:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Update a reuniao
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR), async (req, res) => {
  try {
    const { id } = req.params;
    const data = reuniaoSchema.partial().parse(req.body);
    const reuniao = await prisma.reuniao.update({
      where: { id },
      data,
    });
    res.json(reuniao);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar reunião:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Delete a reuniao
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.reuniao.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar reunião:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Get presencas for a reuniao
router.get('/:id/presencas', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER, UserRole.VIEWER), async (req, res) => {
  try {
    const { id } = req.params;
    const presencas = await prisma.presenca.findMany({
      where: { reuniaoId: id },
      include: { conselheiro: true },
      orderBy: { horarioChegada: 'asc' },
    });
    res.json(presencas);
  } catch (error) {
    console.error('Erro ao buscar presenças da reunião:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Add or update presenca for a reuniao
router.post('/:id/presencas', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER), async (req, res) => {
  try {
    const { id: reuniaoId } = req.params;
    const data = presencaSchema.parse(req.body);

    const presenca = await prisma.presenca.upsert({
      where: { reuniaoId_conselheiroId: { reuniaoId, conselheiroId: data.conselheiroId } },
      update: { ...data, horarioChegada: data.horarioChegada ? new Date(data.horarioChegada) : undefined },
      create: { ...data, reuniaoId, horarioChegada: data.horarioChegada ? new Date(data.horarioChegada) : undefined },
    });
    res.status(201).json(presenca);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao adicionar/atualizar presença:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Update reuniao status
router.patch('/:id/status', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.nativeEnum(ReuniaoStatus) }).parse(req.body);

    const reuniao = await prisma.reuniao.update({
      where: { id },
      data: { status },
    });
    res.json(reuniao);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar status da reunião:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;

