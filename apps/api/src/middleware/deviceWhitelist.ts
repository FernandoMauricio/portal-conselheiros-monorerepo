import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const deviceWhitelist = async (req: Request, res: Response, next: NextFunction) => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    return res.status(400).json({ message: 'Device ID é obrigatório no cabeçalho x-device-id' });
  }

  try {
    const device = await prisma.device.findUnique({
      where: { deviceId: deviceId },
    });

    if (!device || !device.autorizado) {
      return res.status(403).json({ message: 'Dispositivo não autorizado.' });
    }

    // Atualiza o último acesso do dispositivo
    await prisma.device.update({
      where: { id: device.id },
      data: { ultimoAcesso: new Date() },
    });

    next();
  } catch (error) {
    console.error('Erro no middleware de whitelist de dispositivo:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

