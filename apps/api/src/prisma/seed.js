import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    // Criar usuários padrão
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@senac.br' },
        update: {},
        create: {
            email: 'admin@senac.br',
            password: await bcrypt.hash('admin123', 10),
            role: UserRole.ADMIN,
        },
    });
    const moderatorUser = await prisma.user.upsert({
        where: { email: 'moderator@senac.br' },
        update: {},
        create: {
            email: 'moderator@senac.br',
            password: await bcrypt.hash('moderator123', 10),
            role: UserRole.MODERATOR,
        },
    });
    const presenterUser = await prisma.user.upsert({
        where: { email: 'presenter@senac.br' },
        update: {},
        create: {
            email: 'presenter@senac.br',
            password: await bcrypt.hash('presenter123', 10),
            role: UserRole.PRESENTER,
        },
    });
    console.log({ adminUser, moderatorUser, presenterUser });
    // Criar conselheiros de exemplo
    const conselheiros = await Promise.all([
        prisma.conselheiro.upsert({
            where: { email: 'joao.silva@senac.br' },
            update: {},
            create: {
                nome: 'João Silva',
                email: 'joao.silva@senac.br',
                cargo: 'Diretor Regional',
                instituicao: 'Senac SP',
                fotoRefUrl: 'https://example.com/joao.jpg',
            },
        }),
        prisma.conselheiro.upsert({
            where: { email: 'maria.souza@senac.br' },
            update: {},
            create: {
                nome: 'Maria Souza',
                email: 'maria.souza@senac.br',
                cargo: 'Coordenadora de Projetos',
                instituicao: 'Senac RJ',
                fotoRefUrl: 'https://example.com/maria.jpg',
            },
        }),
        prisma.conselheiro.upsert({
            where: { email: 'carlos.lima@senac.br' },
            update: {},
            create: {
                nome: 'Carlos Lima',
                email: 'carlos.lima@senac.br',
                cargo: 'Gerente de TI',
                instituicao: 'Senac MG',
                fotoRefUrl: 'https://example.com/carlos.jpg',
            },
        }),
    ]);
    console.log('Conselheiros criados:', conselheiros.map(c => c.nome));
    // Criar um dispositivo de exemplo
    const exampleDevice = await prisma.device.upsert({
        where: { deviceId: 'tablet-senac-001' },
        update: {},
        create: {
            deviceId: 'tablet-senac-001',
            modelo: 'Samsung Galaxy Tab S7',
            autorizado: true,
            ownerUserId: adminUser.id,
            ultimoAcesso: new Date(),
        },
    });
    console.log('Dispositivo de exemplo criado:', exampleDevice.deviceId);
    // Criar uma reunião de exemplo
    const titulo = 'Reunião do Conselho de Tecnologia - Q3 2025';
    let exampleReuniao = await prisma.reuniao.findFirst({ where: { titulo } });
    if (!exampleReuniao) {
        exampleReuniao = await prisma.reuniao.create({
            data: {
                titulo,
                descricao: 'Discussão sobre as novas tecnologias e projetos para o próximo trimestre.',
                data: new Date('2025-09-15T10:00:00Z'),
                local: 'Sala de Reuniões Principal',
                createdBy: adminUser.id,
                status: 'AGENDADA',
            },
        });
    }
    console.log('Reunião de exemplo criada:', exampleReuniao.titulo);
    // Criar presenças de exemplo para a reunião
    await prisma.presenca.upsert({
        where: { reuniaoId_conselheiroId: { reuniaoId: exampleReuniao.id, conselheiroId: conselheiros[0].id } },
        update: {},
        create: {
            reuniaoId: exampleReuniao.id,
            conselheiroId: conselheiros[0].id,
            presente: true,
            horarioChegada: new Date('2025-09-15T09:55:00Z'),
            metodoRegistro: 'MANUAL',
        },
    });
    await prisma.presenca.upsert({
        where: { reuniaoId_conselheiroId: { reuniaoId: exampleReuniao.id, conselheiroId: conselheiros[1].id } },
        update: {},
        create: {
            reuniaoId: exampleReuniao.id,
            conselheiroId: conselheiros[1].id,
            presente: false,
            horarioChegada: null,
            metodoRegistro: 'MANUAL',
        },
    });
    console.log('Presenças de exemplo criadas para a reunião.');
    console.log('Seed concluído!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
