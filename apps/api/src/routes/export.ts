import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { Parser } from 'json2csv';

const router = Router();
const prisma = new PrismaClient();

// Exportar lista de presenças de uma reunião para CSV
router.get('/:reuniaoId/presencas/csv', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR), async (req, res) => {
  try {
    const { reuniaoId } = req.params;

    const reuniao = await prisma.reuniao.findUnique({
      where: { id: reuniaoId },
      include: {
        presencas: {
          include: { conselheiro: true },
          orderBy: { horarioChegada: 'asc' },
        },
      },
    });

    if (!reuniao) {
      return res.status(404).json({ message: 'Reunião não encontrada' });
    }

    const presencasData = reuniao.presencas.map(p => ({
      'ID Reunião': reuniao.id,
      'Título Reunião': reuniao.titulo,
      'Data Reunião': reuniao.data.toISOString(),
      'Nome Conselheiro': p.conselheiro.nome,
      'Email Conselheiro': p.conselheiro.email || '',
      'Presente': p.presente ? 'Sim' : 'Não',
      'Horário Chegada': p.horarioChegada ? p.horarioChegada.toISOString() : '',
      'Método Registro': p.metodoRegistro || '',
      'Confiança Facial': p.confidence ? p.confidence.toFixed(2) : '',
      'ID Dispositivo': p.deviceId || '',
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(presencasData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`presencas_${reuniao.titulo.replace(/\s/g, '_')}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Erro ao exportar presenças para CSV:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao exportar CSV' });
  }
});

// Exportar lista de conselheiros para CSV
router.get('/conselheiros/csv', authenticateToken, authorizeRoles(UserRole.ADMIN, UserRole.MODERATOR), async (req, res) => {
  try {
    const conselheiros = await prisma.conselheiro.findMany({
      orderBy: { nome: 'asc' },
    });

    const conselheirosData = conselheiros.map(c => ({
      'ID': c.id,
      'Nome': c.nome,
      'Email': c.email || '',
      'Cargo': c.cargo || '',
      'Instituição': c.instituicao || '',
      'Ativo': c.ativo ? 'Sim' : 'Não',
      'URL Foto': c.fotoRefUrl || '',
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(conselheirosData);

    res.header('Content-Type', 'text/csv');
    res.attachment('conselheiros.csv');
    res.send(csv);

  } catch (error) {
    console.error('Erro ao exportar conselheiros para CSV:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao exportar CSV' });
  }
});

export default router;

