#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MANIFEST_FILE="$SCRIPT_DIR/projects.json"

echo "🔄 Sincronizando todos los proyectos del workspace en $WORKSPACE_ROOT..."

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "❌ Error: projects.json no encontrado."
  exit 1
fi

node -e "
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
const workspaceRoot = '$WORKSPACE_ROOT';

console.log('📦 Total de proyectos registrados:', manifest.projects.length);

for (const p of manifest.projects) {
  let targetDir = path.join(workspaceRoot, p.name);
  if (fs.existsSync(targetDir)) {
    let gitDir = targetDir;
    if (!fs.existsSync(path.join(targetDir, '.git'))) {
      const subdirs = fs.readdirSync(targetDir).filter(f => {
        try { return fs.statSync(path.join(targetDir, f)).isDirectory(); } catch { return false; }
      });
      for (const s of subdirs) {
        if (fs.existsSync(path.join(targetDir, s, '.git'))) {
          gitDir = path.join(targetDir, s);
          break;
        }
      }
    }

    try {
      console.log('  🔄 Actualizando ' + p.name + ' (' + path.basename(gitDir) + ')...');
      execSync('git -C \"' + gitDir + '\" pull --quiet origin ' + (p.branch || 'main'), { stdio: 'inherit' });
      console.log('  ✓ ' + p.name + ' al día.');
    } catch (e) {
      console.log('  ⚠️ Error actualizando ' + p.name + ' (comprueba si hay cambios locales sin guardar)');
    }
  } else {
    try {
      console.log('  ⬇️ Clonando ' + p.name + ' desde ' + p.repo + '...');
      execSync('git clone --quiet \"' + p.repo + '\" \"' + targetDir + '\"', { stdio: 'inherit' });
      console.log('  ✓ ' + p.name + ' clonado con éxito.');
    } catch (e) {
      console.log('  ❌ Error clonando ' + p.name + ': ' + e.message);
    }
  }
}
"

echo "✅ Sincronización completa de todos los proyectos."
