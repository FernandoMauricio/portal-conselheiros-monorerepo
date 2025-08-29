#!/usr/bin/env bash
set -euo pipefail

printf "========================================\n"
printf "  Iniciando Ambiente de Desenvolvimento\n"
printf "========================================\n"

printf "\n>>> Iniciando servicos Docker em segundo plano...\n"
docker-compose -f infra/docker-compose.yml up -d

printf "\n>>> Iniciando aplicacoes em modo de desenvolvimento...\n"

# imprime o banner ANTES de entregar o terminal aos processos
printf "\n========================================\n"
printf "  Ambiente de Desenvolvimento Iniciado\n"
printf "========================================\n"
printf "Aperte Ctrl+C para encerrar. Logs a seguir...\n\n"

# substitui o shell pelo processo de dev (vite/nodemon/turbo)
exec pnpm dev
