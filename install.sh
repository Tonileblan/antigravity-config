#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GEMINI_CONFIG_DIR="$HOME/.gemini/config"

echo "🚀 Configurando Antigravity para macOS/Linux..."
mkdir -p "$GEMINI_CONFIG_DIR"
mkdir -p "$GEMINI_CONFIG_DIR/skills"
mkdir -p "$GEMINI_CONFIG_DIR/rules"

# 1. Copiar / Enlazar Skills
echo "📦 Instalando skills..."
for skill_dir in "$SCRIPT_DIR"/skills/*; do
  if [ -d "$skill_dir" ]; then
    skill_name="$(basename "$skill_dir")"
    rm -rf "$GEMINI_CONFIG_DIR/skills/$skill_name"
    cp -R "$skill_dir" "$GEMINI_CONFIG_DIR/skills/$skill_name"
    echo "  ✓ Skill: $skill_name"
  fi
done

# 2. Instalar dependencias de herramientas MCP
echo "⚡ Instalando dependencias de MCP Tools..."
if [ -d "$SCRIPT_DIR/tools/stitch-mcp" ]; then
  cd "$SCRIPT_DIR/tools/stitch-mcp"
  npm install --silent 2>/dev/null || true
  cd "$SCRIPT_DIR"
fi

# 3. Configurar mcp_config.json
echo "🔌 Configurando servidores MCP..."
sed "s|__CONFIG_DIR__|$SCRIPT_DIR|g" "$SCRIPT_DIR/config/mcp_config.mac.json" > "$GEMINI_CONFIG_DIR/mcp_config.json"

echo "✅ ¡Antigravity en macOS sincronizado correctamente!"
