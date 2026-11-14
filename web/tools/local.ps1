# Local preview of the Brightyard sites on Windows, started by start-local.bat (double-click) in the repository folder.
# Needs Node.js (https://nodejs.org, the LTS version). Gets the latest code from GitHub when it starts and every
# 30 seconds while it runs; the open page updates by itself when files change. Forms and the API do not work here.
param([ValidateSet('main', 'allocivo', 'xessly')][string]$Site = 'main')

$web = Split-Path -Parent $PSScriptRoot
$repo = Split-Path -Parent $web
Set-Location $web

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'Node.js is not installed. Install it from https://nodejs.org (the LTS version), then start again.' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}
$hasGit = [bool](Get-Command git -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $repo '.git'))

function Update-Code {
    if (-not $hasGit) { return '' }
    $out = git -C $repo pull --ff-only 2>&1 | Out-String
    if ($out -notmatch 'Already up to date') { Write-Host ('[{0:HH:mm:ss}] Got the latest changes from GitHub' -f (Get-Date)) -ForegroundColor Green }
    return $out
}

Update-Code | Out-Null
Write-Host 'Checking the tools the site needs (the first time this takes a minute or two)...'
npm install --no-audit --no-fund --loglevel=error
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Installing the tools failed: see the messages above.' -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}

$port = @{ main = 4321; allocivo = 4322; xessly = 4323 }[$Site]
$dev = Start-Process -FilePath 'node' -ArgumentList ('"' + (Join-Path $web 'tools\dev.mjs') + '"'), $Site -WorkingDirectory $web -NoNewWindow -PassThru
Start-Sleep -Seconds 5
Start-Process "http://localhost:$port/"
Write-Host "The $Site site is open at http://localhost:$port/ - keep this window open, close it to stop." -ForegroundColor Cyan
if (-not $hasGit) { Write-Host 'Git is not installed, so new changes will not be downloaded automatically.' -ForegroundColor Yellow }

while (-not $dev.HasExited) {
    Start-Sleep -Seconds 30
    $out = Update-Code
    if ($out -match 'package(-lock)?\.json') { Write-Host 'The update needs new tools: close this window and start the preview again.' -ForegroundColor Yellow }
}
