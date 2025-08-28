#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "========================================"
echo "  Iniciando Build de Producao"
echo "========================================"

# Executar o build de todas as aplicações usando Turbo
echo "\n>>> Executando build de todas as aplicacoes..."
pnpm build

echo "\n========================================"
echo "  Build Concluido!"
echo "========================================"
e"


