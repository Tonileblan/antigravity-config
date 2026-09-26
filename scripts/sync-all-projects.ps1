# Script de sincronización automática de todos los proyectos para Windows
# Ejecutar en PowerShell: .\scripts\sync-all-projects.ps1

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ConfigRoot = Split-Path -Parent $ScriptDir
$WorkspaceRoot = Split-Path -Parent $ConfigRoot
$ManifestPath = Join-Path $ConfigRoot "projects.json"

Write-Host "🔄 Sincronizando proyectos en $WorkspaceRoot..." -ForegroundColor Cyan

# 1. Asegurar que antigravity-config tiene la última versión del repositorio
try {
    Push-Location $ConfigRoot
    git pull origin main
    Pop-Location
} catch {}

if (!(Test-Path $ManifestPath)) {
    Write-Host "❌ Error: No se encontró projects.json en $ManifestPath" -ForegroundColor Red
    exit 1
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

Write-Host "📦 Total de proyectos registrados: $($manifest.projects.Count)" -ForegroundColor Yellow

foreach ($p in $manifest.projects) {
    $targetDir = Join-Path $WorkspaceRoot $p.name
    if ($p.name -eq "antigravity-config") {
        continue
    }

    if (Test-Path $targetDir) {
        Write-Host "  🔄 Actualizando $($p.name)..." -ForegroundColor Gray
        try {
            Push-Location $targetDir
            git pull origin $p.branch
            Pop-Location
            Write-Host "  ✓ $($p.name) al día." -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Advertencia al actualizar $($p.name)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⬇️ Clonando $($p.name) desde $($p.repo)..." -ForegroundColor Cyan
        try {
            git clone $p.repo $targetDir
            Write-Host "  ✓ $($p.name) clonado con éxito." -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Error al clonar $($p.name)" -ForegroundColor Red
        }
    }
}

Write-Host "✅ ¡Todos los proyectos están 100% sincronizados en tu PC ($WorkspaceRoot)!" -ForegroundColor Green
