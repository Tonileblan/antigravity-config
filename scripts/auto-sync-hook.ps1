# Antigravity startup auto-sync hook for Windows

$ScriptDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    git pull --quiet origin main 2>$null
} -ArgumentList $ScriptDir | Out-Null

# Output valid empty JSON response for hook protocol
"{}"
