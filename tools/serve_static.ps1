param(
  [Parameter(Mandatory = $false)]
  [int]$Port = 8088,

  [Parameter(Mandatory = $false)]
  [string]$Root = (Get-Location).Path,

  [Parameter(Mandatory = $false)]
  [string]$DefaultDocument = 'index.html'
)

$ErrorActionPreference = 'Stop'

function Get-ContentType {
  param([string]$Path)

  $ext = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
  switch ($ext) {
    '.html' { 'text/html; charset=utf-8' }
    '.htm' { 'text/html; charset=utf-8' }
    '.css' { 'text/css' }
    '.js' { 'application/javascript' }
    '.json' { 'application/json' }
    '.png' { 'image/png' }
    '.jpg' { 'image/jpeg' }
    '.jpeg' { 'image/jpeg' }
    '.webp' { 'image/webp' }
    '.gif' { 'image/gif' }
    '.svg' { 'image/svg+xml' }
    '.ico' { 'image/x-icon' }
    '.woff' { 'font/woff' }
    '.woff2' { 'font/woff2' }
    '.ttf' { 'font/ttf' }
    '.mp4' { 'video/mp4' }
    '.webm' { 'video/webm' }
    '.pdf' { 'application/pdf' }
    default { 'application/octet-stream' }
  }
}

$prefix = "http://localhost:$Port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host "Failed to start server on $prefix" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ''
  Write-Host 'Common fixes:' -ForegroundColor Yellow
  Write-Host "- Port already in use: try a different port" -ForegroundColor Yellow
  Write-Host "- URL reservation needed: run as Administrator or add a URLACL" -ForegroundColor Yellow
  Write-Host "  netsh http add urlacl url=$prefix user=$env:USERNAME" -ForegroundColor Yellow
  exit 1
}

$script:shouldStop = $false
$cancelHandler = [System.ConsoleCancelEventHandler]{
  param($source, $e)
  $e.Cancel = $true
  $script:shouldStop = $true
  try { $listener.Stop() } catch {}
}

try {
  [Console]::add_CancelKeyPress($cancelHandler)
} catch {
  # If event wiring fails (rare hosts), Ctrl+C will still terminate the process.
}

Write-Host "Serving: $Root" -ForegroundColor Cyan
Write-Host "Listening: $prefix" -ForegroundColor Cyan
Write-Host 'Press Ctrl+C to stop.' -ForegroundColor Cyan

try {
  while (-not $script:shouldStop) {
    $context = $null

    try {
      $context = $listener.GetContext()
    } catch {
      if ($script:shouldStop) { break }
      continue
    }

    $request = $context.Request
    $response = $context.Response

    try {
      $localPath = $request.Url.LocalPath
      if ([string]::IsNullOrWhiteSpace($localPath) -or $localPath -eq '/') {
        $localPath = '/' + $DefaultDocument
      }

      $relativePath = $localPath.TrimStart('/')
      $filePath = Join-Path $Root $relativePath

      if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = Get-ContentType -Path $filePath
        $response.ContentLength64 = $bytes.Length

        $response.Headers['Access-Control-Allow-Origin'] = '*'
        $response.Headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        $response.Headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'

        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $response.StatusCode = 404
        $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 - File Not Found')
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
      }
    } catch {
      try {
        $response.StatusCode = 500
        $errBytes = [System.Text.Encoding]::UTF8.GetBytes("500 - Server Error\n" + $_.Exception.Message)
        $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
      } catch {}
    } finally {
      try { $response.OutputStream.Close() } catch {}
    }
  }
} finally {
  try { [Console]::remove_CancelKeyPress($cancelHandler) } catch {}
  try { $listener.Close() } catch {}
  Write-Host 'Server stopped.' -ForegroundColor DarkYellow
}
