// apps/api/src/routes/stats.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
    const [reunioes, conselheiros, dispositivos] = await Promise.all([
        prisma.reuniao.count(),
        prisma.conselheiro.count(),
        prisma.device.count(),
    ]);

    // exemplo simples de "atividade"
    const atividade = [
        { id: "1", texto: "Seed inicial aplicado." },
    ];

    res.json({ reunioes, conselheiros, dispositivos, atividade });
});

export default router;
