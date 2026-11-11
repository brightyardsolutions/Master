# Local preview server for the BrightYard site (Windows PowerShell, no extra installs).
# Serves this folder at http://localhost:8080 and pulls the latest code from GitHub
# whenever the page is reloaded (at most every 20 seconds). Start it with start-local.bat.
param([int]$Port = 8080)

$root = (Resolve-Path $PSScriptRoot).Path.TrimEnd('\') + '\'
Set-Location $root
$hasGit = [bool](Get-Command git -ErrorAction SilentlyContinue)
$lastPull = [datetime]::MinValue

function Update-Site {
    if (-not $hasGit -or -not (Test-Path (Join-Path $root '.git'))) { return }
    $out = git pull --ff-only 2>&1 | Out-String
    $script:lastPull = Get-Date
    if ($out -match 'Already up to date') { return }
    Write-Host ("[{0:HH:mm:ss}] Pulled latest changes" -f (Get-Date)) -ForegroundColor Green
    Write-Host $out.Trim()
}

$types = @{
    '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'
    '.webp' = 'image/webp'; '.ico' = 'image/x-icon'; '.woff2' = 'font/woff2'; '.md' = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() } catch {
    Write-Host "Port $Port is already in use. Close the other window running the site, or run: start-local.bat 8081" -ForegroundColor Red
    Read-Host 'Press Enter to exit'; exit 1
}

Write-Host "BrightYard is running at http://localhost:$Port/" -ForegroundColor Cyan
if ($hasGit) { Write-Host 'Reload the page in your browser to pick up new changes from GitHub.' }
else { Write-Host 'Git is not installed, so new changes will not be downloaded automatically.' -ForegroundColor Yellow }
Write-Host 'Keep this window open. Close it (or press Ctrl+C) to stop the site.'
Update-Site
Start-Process "http://localhost:$Port/"

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $res = $ctx.Response
        try {
            $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
            if ($path -eq '' -or $path -eq 'index.html') {
                if (((Get-Date) - $lastPull).TotalSeconds -gt 20) { Update-Site }
                $path = 'index.html'
            }
            $full = [IO.Path]::GetFullPath((Join-Path $root ($path -replace '/', '\')))
            if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or $full -match '\\\.git(\\|$)') {
                $res.StatusCode = 403
            } elseif (Test-Path -LiteralPath $full -PathType Leaf) {
                $bytes = [IO.File]::ReadAllBytes($full)
                $ext = [IO.Path]::GetExtension($full).ToLower()
                $res.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
                $res.Headers['Cache-Control'] = 'no-store'
                $res.ContentLength64 = $bytes.Length
                $res.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $res.StatusCode = 404
            }
        } catch {
            $res.StatusCode = 500
        } finally {
            $res.Close()
        }
    }
} finally {
    $listener.Stop()
}
