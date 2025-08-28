import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type Secret, type SignOptions, type JwtPayload } from "jsonwebtoken";
import { z } from "zod";

const router = Router();
const prisma = new PrismaClient();

// Segredos e TTLs (use variáveis reais em produção!)
const ACCESS_TOKEN_SECRET: Secret = process.env.JWT_SECRET ?? "dev_access_secret";
const REFRESH_TOKEN_SECRET: Secret = process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret";

const ACCESS_TTL: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN as any) ?? "15m";
const REFRESH_TTL: SignOptions["expiresIn"] = (process.env.JWT_REFRESH_EXPIRES_IN as any) ?? "7d";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciais inválidas" });
        }

        // Gere tokens usando Secret tipado e options com expiresIn
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TTL }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TTL }
        );

        res.json({ accessToken, refreshToken });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
});

const refreshSchema = z.object({
    refreshToken: z.string().min(1),
});

router.post("/refresh", async (req, res) => {
    const parse = refreshSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(401).json({ message: "Token de atualização não fornecido" });
    }
    const { refreshToken } = parse.data;

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as JwtPayload | string;

        // Garanta que decodificou objeto e tem id
        const id =
            typeof decoded === "object" && decoded && "id" in decoded
                ? (decoded as any).id as string
                : undefined;

        if (!id) {
            return res.status(403).json({ message: "Token de atualização inválido" });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(403).json({ message: "Token de atualização inválido" });
        }

        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TTL }
        );

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Erro ao atualizar token:", error);
        res.status(403).json({ message: "Token de atualização inválido ou expirado" });
    }
});

export default router;
