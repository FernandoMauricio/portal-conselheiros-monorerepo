#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "========================================"
echo "  Iniciando Limpeza do Ambiente"
echo "========================================"

# Parar e remover containers Docker
echo "\n>>> Parando e removendo containers Docker..."
docker-compose -f infra/docker-compose.yml down -v

# Limpar caches e node_modules
echo "\n>>> Limpando caches e node_modules..."
pnpm clean

# Remover diretórios de build/dist
echo "\n>>> Removendo diretorios de build/dist..."
rm -rf apps/*/dist
rm -rf apps/*/build
rm -rf packages/*/dist
rm -rf packages/*/build

echo "\n========================================"
echo "  Limpeza Concluida!"
echo "========================================"


