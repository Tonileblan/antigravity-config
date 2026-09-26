# Script de sincronización desde Windows
# Ejecutar en PowerShell: .\sync.ps1

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ScriptDir

$msg = if ($args.Count -gt 0) { $args -join " " } else { "Update Antigravity skills from Windows" }

Write-Host "🔄 Sincronizando cambios hacia GitHub..." -ForegroundColor Cyan
git add .
git commit -m "$msg"
git push origin main
Write-Host "✅ ¡Cambios subidos a GitHub! En Mac solo ejecuta: git pull y ./install.sh" -ForegroundColor Green
