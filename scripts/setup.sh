#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "========================================"
echo "  Iniciando Setup do Portal Conselheiros"
echo "========================================"

# 1. Instalar dependências do pnpm
echo "\n>>> Instalando dependencias do pnpm..."
pnpm install

# 2. Copiar .env.example para .env em apps/api, apps/media-gateway, apps/mobile, apps/web e infra
echo "\n>>> Copiando arquivos .env.example para .env..."
find . -name ".env.example" | while read f; do
  cp "$f" "${f%.example}"
  echo "  Copiado $f para ${f%.example}"
done

# 3. Iniciar Docker Compose (PostgreSQL, MinIO, LiveKit, COTURN, Redis)
echo "\n>>> Iniciando servicos Docker (PostgreSQL, MinIO, LiveKit, COTURN, Redis)..."
docker-compose -f infra/docker-compose.yml up -d

echo "  Aguardando 10 segundos para os servicos Docker inicializarem..."
sleep 10

# 4. Gerar Prisma Client e rodar migrações
echo "\n>>> Gerando Prisma Client e rodando migracoes..."
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate:dev

# 5. Rodar seed do banco de dados
echo "\n>>> Rodando seed do banco de dados..."
pnpm --filter api prisma:db:seed

# 6. Build inicial das aplicações
echo "\n>>> Realizando build inicial das aplicacoes..."
pnpm build

echo "\n========================================"
echo "  Setup Concluido!"
echo "========================================"
echo "Agora voce pode iniciar o ambiente de desenvolvimento com: ./scripts/dev.sh"


