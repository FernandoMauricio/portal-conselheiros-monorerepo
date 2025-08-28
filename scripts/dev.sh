#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "========================================"
echo "  Iniciando Ambiente de Desenvolvimento"
echo "========================================"

# Iniciar os serviços Docker em segundo plano
echo "\n>>> Iniciando servicos Docker em segundo plano..."
docker-compose -f infra/docker-compose.yml up -d

# Iniciar todas as aplicações em modo de desenvolvimento usando Turbo
echo "\n>>> Iniciando aplicacoes em modo de desenvolvimento..."
pnpm dev

echo "\n========================================"
echo "  Ambiente de Desenvolvimento Iniciado"
echo "========================================"


