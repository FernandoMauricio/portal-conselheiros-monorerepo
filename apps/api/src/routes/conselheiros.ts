import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { faceRecognitionService } from '../services/faceRecognition';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({ dest: 'uploads/' });

const conselheiroSchema = z.object({
  nome: z.string().min(2).max(255),
  email: z.string().email().optional().or(z.literal('')), // Allow empty string for optional email
  cargo: z.string().max(255).optional().or(z.literal('')), // Allow empty string for optional cargo
  instituicao: z.string().max(255).optional().or(z.literal('')), // Allow empty string for optional instituicao
});

// Get all conselheiros
router.get('/', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER), async (req, res) => {
  try {
    const conselheiros = await prisma.conselheiro.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(conselheiros);
  } catch (error) {
    console.error('Erro ao buscar conselheiros:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Get conselheiro by ID
router.get('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR, UserRole.PRESENTER), async (req, res) => {
  try {
    const { id } = req.params;
    const conselheiro = await prisma.conselheiro.findUnique({
      where: { id },
    });
    if (!conselheiro) {
      return res.status(404).json({ message: 'Conselheiro não encontrado' });
    }
    res.json(conselheiro);
  } catch (error) {
    console.error('Erro ao buscar conselheiro por ID:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Create a new conselheiro
router.post('/', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR), async (req, res) => {
  try {
    const data = conselheiroSchema.parse(req.body);
    const conselheiro = await prisma.conselheiro.create({ data });
    res.status(201).json(conselheiro);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao criar conselheiro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Update a conselheiro
router.put('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR), async (req, res) => {
  try {
    const { id } = req.params;
    const data = conselheiroSchema.partial().parse(req.body);
    const conselheiro = await prisma.conselheiro.update({
      where: { id },
      data,
    });
    res.json(conselheiro);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Erro ao atualizar conselheiro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Delete a conselheiro
router.delete('/:id', authenticateToken, authorizeRoles(UserRole.ADMIN), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.conselheiro.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar conselheiro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload photo for face recognition
router.post('/:id/photo', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR), upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto enviada' });
    }

    const conselheiro = await prisma.conselheiro.findUnique({ where: { id } });
    if (!conselheiro) {
      return res.status(404).json({ message: 'Conselheiro não encontrado' });
    }

    // Process the photo for face recognition (e.g., save to MinIO, extract features)
    const photoUrl = await faceRecognitionService.uploadPhoto(req.file.path, id);

    await prisma.conselheiro.update({
      where: { id },
      data: { fotoRefUrl: photoUrl },
    });

    res.json({ message: 'Foto enviada e processada com sucesso', photoUrl });
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao processar foto' });
  }
});

// Verify presence using face recognition
router.post('/verify-presence', authenticateToken, authorizeRoles(UserRole.PRESENTER), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto enviada para verificação' });
    }
    const { reuniaoId } = req.body;

    if (!reuniaoId) {
      return res.status(400).json({ message: 'ID da reunião é obrigatório' });
    }

    const result = await faceRecognitionService.verifyPresence(req.file.path, reuniaoId);

    if (result.conselheiroId) {
      // Record presence
      await prisma.presenca.upsert({
        where: { reuniaoId_conselheiroId: { reuniaoId, conselheiroId: result.conselheiroId } },
        update: { presente: true, horarioChegada: new Date(), metodoRegistro: 'FACIAL', confidence: result.confidence },
        create: {
          reuniaoId,
          conselheiroId: result.conselheiroId,
          presente: true,
          horarioChegada: new Date(),
          metodoRegistro: 'FACIAL',
          confidence: result.confidence,
          deviceId: req.headers['x-device-id'] as string || 'unknown',
        },
      });
      res.json({ message: 'Presença registrada com sucesso', conselheiro: result.conselheiro });
    } else {
      res.status(404).json({ message: 'Conselheiro não reconhecido ou não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao verificar presença:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao verificar presença' });
  }
});

export default router;

