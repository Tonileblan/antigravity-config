# Script de instalación y sincronización para Windows
# Ejecutar en PowerShell: .\install.ps1

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$GeminiConfigDir = Join-Path $env:USERPROFILE ".gemini\config"

Write-Host "🚀 Configurando Antigravity para Windows..." -ForegroundColor Cyan

# 1. Crear directorios base
New-Item -ItemType Directory -Force -Path $GeminiConfigDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $GeminiConfigDir "skills") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $GeminiConfigDir "rules") | Out-Null

# 2. Copiar Skills
Write-Host "📦 Instalando skills..." -ForegroundColor Yellow
$skills = Get-ChildItem -Directory -Path (Join-Path $ScriptDir "skills")
foreach ($skill in $skills) {
    $targetPath = Join-Path (Join-Path $GeminiConfigDir "skills") $skill.Name
    if (Test-Path $targetPath) {
        Remove-Item -Recurse -Force $targetPath
    }
    Copy-Item -Recurse -Force $skill.FullName $targetPath
    Write-Host "  ✓ Skill: $($skill.Name)" -ForegroundColor Green
}

# 3. Copiar Reglas (Rules)
Write-Host "📜 Instalando reglas automáticas..." -ForegroundColor Yellow
$rules = Get-ChildItem -File -Path (Join-Path $ScriptDir "rules")
foreach ($rule in $rules) {
    $targetRule = Join-Path (Join-Path $GeminiConfigDir "rules") $rule.Name
    Copy-Item -Force $rule.FullName $targetRule
    Write-Host "  ✓ Rule: $($rule.Name)" -ForegroundColor Green
}

# 4. Copiar Hooks de ciclo de vida
$hooksFile = Join-Path $ScriptDir "hooks.json"
if (Test-Path $hooksFile) {
    Copy-Item -Force $hooksFile (Join-Path $GeminiConfigDir "hooks.json")
    Write-Host "  ✓ Hooks: hooks.json configurado" -ForegroundColor Green
}

# 5. Instalar dependencias MCP en Windows
Write-Host "⚡ Instalando dependencias de MCP Tools..." -ForegroundColor Yellow
$mcpToolDir = Join-Path $ScriptDir "tools\stitch-mcp"
if (Test-Path $mcpToolDir) {
    Push-Location $mcpToolDir
    npm install --silent
    Pop-Location
}

# 6. Configurar mcp_config.json para Windows
Write-Host "🔌 Configurando servidores MCP..." -ForegroundColor Yellow
$template = Get-Content (Join-Path $ScriptDir "config\mcp_config.windows.json") -Raw
$escapedScriptDir = $ScriptDir.Replace("\", "\\")
$resolvedConfig = $template.Replace("__CONFIG_DIR__", $escapedScriptDir)
$resolvedConfig | Set-Content (Join-Path $GeminiConfigDir "mcp_config.json") -Encoding UTF8

Write-Host "✅ ¡Antigravity en Windows sincronizado con éxito!" -ForegroundColor Green
Write-Host "Ahora cada inicio de sesión se sincronizará automáticamente." -ForegroundColor Cyan
