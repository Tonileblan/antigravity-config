#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

MSG="${1:-Update Antigravity skills and configuration}"

echo "🔄 Sincronizando skills locales hacia el repositorio..."
git add .
git commit -m "$MSG" || echo "No hay cambios nuevos para commitear."
git push origin main
echo "✅ ¡Cambios subidos a GitHub! En Windows solo ejecuta: git pull y .\install.ps1"
