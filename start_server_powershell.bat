@echo off
echo Starting Interactive Handbook Web Server...
echo.
echo Server will be available at: http://localhost:8080/diaperschooltcg.html
echo.
echo Opening browser...
start http://localhost:8080/diaperschooltcg.html
echo.
echo Starting PowerShell web server...
echo Press Ctrl+C to stop the server
echo.

powershell -Command "& { Add-Type -AssemblyName System.Web; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host 'Server started at http://localhost:8080'; try { while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $localPath = $request.Url.LocalPath; if ($localPath -eq '/') { $localPath = '/index.html' }; $filePath = Join-Path (Get-Location) $localPath.TrimStart('/'); if (Test-Path $filePath -PathType Leaf) { $content = [System.IO.File]::ReadAllBytes($filePath); $response.ContentLength64 = $content.Length; $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); switch ($ext) { '.html' { $response.ContentType = 'text/html; charset=utf-8' } '.css' { $response.ContentType = 'text/css' } '.js' { $response.ContentType = 'application/javascript' } '.json' { $response.ContentType = 'application/json' } '.png' { $response.ContentType = 'image/png' } '.jpg' { $response.ContentType = 'image/jpeg' } '.jpeg' { $response.ContentType = 'image/jpeg' } '.webp' { $response.ContentType = 'image/webp' } '.gif' { $response.ContentType = 'image/gif' } '.svg' { $response.ContentType = 'image/svg+xml' } '.ico' { $response.ContentType = 'image/x-icon' } '.woff' { $response.ContentType = 'font/woff' } '.woff2' { $response.ContentType = 'font/woff2' } '.ttf' { $response.ContentType = 'font/ttf' } default { $response.ContentType = 'application/octet-stream' } }; $response.Headers.Add('Access-Control-Allow-Origin', '*'); $response.Headers.Add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); $response.Headers.Add('Access-Control-Allow-Headers', 'Content-Type, Authorization'); $response.OutputStream.Write($content, 0, $content.Length); } else { $response.StatusCode = 404; $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 - File Not Found'); $response.OutputStream.Write($notFound, 0, $notFound.Length); }; $response.OutputStream.Close(); } } catch { Write-Host 'Server stopped' } finally { $listener.Stop() } }"

echo.
echo Server stopped.
pause
