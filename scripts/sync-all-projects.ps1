# Script de sincronizacion automatica de todos los proyectos para Windows
# Ejecutar en PowerShell: .\scripts\sync-all-projects.ps1

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ConfigRoot = Split-Path -Parent $ScriptDir
$WorkspaceRoot = Split-Path -Parent $ConfigRoot
$ManifestPath = Join-Path $ConfigRoot "projects.json"

Write-Host "-> Sincronizando proyectos en $WorkspaceRoot..." -ForegroundColor Cyan

# 1. Asegurar que antigravity-config tiene la ultima version del repositorio
try {
    Push-Location $ConfigRoot
    git pull origin main
    Pop-Location
} catch {}

if (-not (Test-Path $ManifestPath)) {
    Write-Host "ERROR: No se encontro projects.json en $ManifestPath" -ForegroundColor Red
    exit 1
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json

Write-Host "-> Total de proyectos registrados: $($manifest.projects.Count)" -ForegroundColor Yellow

foreach ($p in $manifest.projects) {
    $targetDir = Join-Path $WorkspaceRoot $p.name
    if ($p.name -eq "antigravity-config") {
        continue
    }

    if (Test-Path $targetDir) {
        $gitDir = $targetDir
        if (-not (Test-Path (Join-Path $targetDir ".git"))) {
            $subDirs = Get-ChildItem -Directory -Path $targetDir
            foreach ($sub in $subDirs) {
                if (Test-Path (Join-Path $sub.FullName ".git")) {
                    $gitDir = $sub.FullName
                    break
                }
            }
        }

        $dirName = Split-Path -Leaf $gitDir
        Write-Host "  -> Actualizando $($p.name) ($dirName)..." -ForegroundColor Gray
        try {
            Push-Location $gitDir
            git pull origin $p.branch
            Pop-Location
            Write-Host "  OK $($p.name) al dia." -ForegroundColor Green
        } catch {
            Write-Host "  AVISO: Problema al actualizar $($p.name)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  -> Clonando $($p.name) desde $($p.repo)..." -ForegroundColor Cyan
        try {
            git clone $p.repo $targetDir
            Write-Host "  OK $($p.name) clonado con exito." -ForegroundColor Green
        } catch {
            Write-Host "  ERROR: No se pudo clonar $($p.name)" -ForegroundColor Red
        }
    }
}

Write-Host "OK: Todos los proyectos estan 100% sincronizados en tu PC ($WorkspaceRoot)!" -ForegroundColor Green
