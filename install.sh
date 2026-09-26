#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GEMINI_CONFIG_DIR="$HOME/.gemini/config"

echo "🚀 Configurando Antigravity para macOS/Linux..."
mkdir -p "$GEMINI_CONFIG_DIR"
mkdir -p "$GEMINI_CONFIG_DIR/skills"
mkdir -p "$GEMINI_CONFIG_DIR/rules"

# 1. Copiar Skills
echo "📦 Instalando skills..."
for skill_dir in "$SCRIPT_DIR"/skills/*; do
  if [ -d "$skill_dir" ]; then
    skill_name="$(basename "$skill_dir")"
    rm -rf "$GEMINI_CONFIG_DIR/skills/$skill_name"
    cp -R "$skill_dir" "$GEMINI_CONFIG_DIR/skills/$skill_name"
    echo "  ✓ Skill: $skill_name"
  fi
done

# 2. Copiar Reglas (Rules)
echo "📜 Instalando reglas automáticas..."
for rule_file in "$SCRIPT_DIR"/rules/*; do
  if [ -f "$rule_file" ]; then
    rule_name="$(basename "$rule_file")"
    cp "$rule_file" "$GEMINI_CONFIG_DIR/rules/$rule_name"
    echo "  ✓ Rule: $rule_name"
  fi
done

# 3. Copiar Hooks de ciclo de vida
if [ -f "$SCRIPT_DIR/hooks.json" ]; then
  cp "$SCRIPT_DIR/hooks.json" "$GEMINI_CONFIG_DIR/hooks.json"
  echo "  ✓ Hooks: hooks.json configurado"
fi

# 4. Instalar dependencias de herramientas MCP
echo "⚡ Instalando dependencias de MCP Tools..."
if [ -d "$SCRIPT_DIR/tools/stitch-mcp" ]; then
  cd "$SCRIPT_DIR/tools/stitch-mcp"
  npm install --silent 2>/dev/null || true
  cd "$SCRIPT_DIR"
fi

# 5. Configurar mcp_config.json
echo "🔌 Configurando servidores MCP..."
sed "s|__CONFIG_DIR__|$SCRIPT_DIR|g" "$SCRIPT_DIR/config/mcp_config.mac.json" > "$GEMINI_CONFIG_DIR/mcp_config.json"

echo "✅ ¡Antigravity en macOS sincronizado correctamente con reglas automáticas!"
