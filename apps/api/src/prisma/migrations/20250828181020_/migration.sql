-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MODERATOR', 'PRESENTER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ReuniaoStatus" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'ENCERRADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StreamStatus" AS ENUM ('CREATED', 'ACTIVE', 'ENDED', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conselheiros" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "cargo" TEXT,
    "instituicao" TEXT,
    "foto_ref_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conselheiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reunioes" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT,
    "status" "ReuniaoStatus" NOT NULL DEFAULT 'AGENDADA',
    "stream_room_id" TEXT,
    "recording_url" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reunioes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presencas" (
    "id" UUID NOT NULL,
    "reuniao_id" UUID NOT NULL,
    "conselheiro_id" UUID NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "horario_chegada" TIMESTAMP(3),
    "metodo_registro" TEXT,
    "confidence" DECIMAL(3,2),
    "device_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presencas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "device_id" TEXT NOT NULL,
    "modelo" TEXT,
    "autorizado" BOOLEAN NOT NULL DEFAULT false,
    "owner_user_id" UUID,
    "ultimo_acesso" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stream_sessions" (
    "id" UUID NOT NULL,
    "reuniao_id" UUID NOT NULL,
    "room_name" TEXT NOT NULL,
    "status" "StreamStatus" NOT NULL DEFAULT 'CREATED',
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "recording_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stream_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "conselheiros_email_key" ON "conselheiros"("email");

-- CreateIndex
CREATE UNIQUE INDEX "presencas_reuniao_id_conselheiro_id_key" ON "presencas"("reuniao_id", "conselheiro_id");

-- CreateIndex
CREATE UNIQUE INDEX "devices_device_id_key" ON "devices"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "stream_sessions_reuniao_id_key" ON "stream_sessions"("reuniao_id");

-- AddForeignKey
ALTER TABLE "reunioes" ADD CONSTRAINT "reunioes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_reuniao_id_fkey" FOREIGN KEY ("reuniao_id") REFERENCES "reunioes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presencas" ADD CONSTRAINT "presencas_conselheiro_id_fkey" FOREIGN KEY ("conselheiro_id") REFERENCES "conselheiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stream_sessions" ADD CONSTRAINT "stream_sessions_reuniao_id_fkey" FOREIGN KEY ("reuniao_id") REFERENCES "reunioes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
