import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const prisma = new PrismaClient();

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: 'us-east-1', // MinIO doesn't strictly use regions, but a value is required
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'portal-conselheiros';
const FACE_RECOGNITION_ENDPOINT = process.env.FACE_RECOGNITION_ENDPOINT || 'http://localhost:8000';
const CONFIDENCE_THRESHOLD = parseFloat(process.env.FACE_RECOGNITION_CONFIDENCE_THRESHOLD || '0.8');

class FaceRecognitionService {
  async uploadPhoto(filePath: string, conselheiroId: string): Promise<string> {
    const fileStream = fs.createReadStream(filePath);
    const objectKey = `fotos/conselheiros/${conselheiroId}-${Date.now()}.jpg`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
      Body: fileStream,
      ContentType: 'image/jpeg',
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      fs.unlinkSync(filePath); // Remove local file after upload
      const url = `${process.env.MINIO_ENDPOINT}/${BUCKET_NAME}/${objectKey}`;
      console.log(`Foto ${objectKey} uploaded to MinIO. URL: ${url}`);
      return url;
    } catch (error) {
      console.error('Error uploading photo to MinIO:', error);
      throw new Error('Failed to upload photo to storage.');
    }
  }

  async getPhotoUrl(objectKey: string): Promise<string> {
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: objectKey,
    };
    // Generate a presigned URL for temporary access
    return getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), { expiresIn: 3600 }); // URL expires in 1 hour
  }

  async verifyPresence(photoPath: string, reuniaoId: string): Promise<{ conselheiroId?: string; conselheiro?: any; confidence?: number }> {
    try {
      const conselheiros = await prisma.conselheiro.findMany({ where: { ativo: true, fotoRefUrl: { not: null } } });

      if (conselheiros.length === 0) {
        console.warn('Nenhum conselheiro ativo com foto de referência encontrado para verificação.');
        fs.unlinkSync(photoPath);
        return {};
      }

      const formData = new FormData();
      formData.append('image', fs.createReadStream(photoPath));

      // Fornecer todas as fotos de referência para o serviço de reconhecimento facial
      const referenceImages = conselheiros.map(c => ({
        id: c.id,
        url: c.fotoRefUrl,
      }));
      formData.append('reference_images', JSON.stringify(referenceImages));

      const response = await axios.post(`${FACE_RECOGNITION_ENDPOINT}/recognize`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      fs.unlinkSync(photoPath); // Remove local file after processing

      const { recognized, match_id, confidence } = response.data;

      if (recognized && match_id && confidence >= CONFIDENCE_THRESHOLD) {
        const conselheiro = await prisma.conselheiro.findUnique({ where: { id: match_id } });
        return { conselheiroId: match_id, conselheiro, confidence };
      } else {
        return {};
      }
    } catch (error) {
      console.error('Erro ao comunicar com o serviço de reconhecimento facial:', error);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      throw new Error('Falha na verificação de presença via reconhecimento facial.');
    }
  }
}

export const faceRecognitionService = new FaceRecognitionService();

