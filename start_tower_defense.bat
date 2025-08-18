@echo off
setlocal
REM If 'nogui' is passed, show the CLI menu; otherwise open the HTML launcher by default
if /I "%~1"=="nogui" goto menu
goto launch_gui

:menu
echo ===============================================
echo    Interactive Handbook Game Launcher
echo ===============================================
echo.
echo Please select a game to launch:
echo.
echo 1. Magic Vortex Defense
echo 2. Old War Defense (Tower Defense)
echo 3. Obelisk Gaze
echo 4. Magidueler
echo 5. Scholia Battle RPG (Plains Mini Battle)
echo 6. Expedition Runner
echo 7. Fishing Adventure
echo.
echo 0. Exit
echo.
set /p choice="Enter your choice (1-7, 0 to exit): "

if "%choice%"=="1" (
    set game=magicvortexdefense.html
    set gamename=Magic Vortex Defense
    goto :startgame
)
if "%choice%"=="2" (
    set game=Old War Defense.html
    set gamename=Old War Defense
    goto :startgame
)
if "%choice%"=="3" (
    set game=obeliskgaze.html
    set gamename=Obelisk Gaze
    goto :startgame
)
if "%choice%"=="4" (
    set game=Magidueler.html
    set gamename=Magidueler
    goto :startgame
)
if "%choice%"=="5" (
    set game=plainsminibattle.html
    set gamename=Scholia Battle RPG
    goto :startgame
)
if "%choice%"=="6" (
    set game=expeditionrunner.html
    set gamename=Expedition Runner
    goto :startgame
)
if "%choice%"=="7" (
    set game=src/fishingminigame.html
    set gamename=Fishing Adventure
    goto :startgame
)
if "%choice%"=="0" (
    echo Goodbye!
    pause
    exit
)

echo Invalid choice. Please try again.
pause
goto :menu

:launch_gui
echo.
echo Starting Interactive Handbook Games Web Server...
echo.
echo Server will be available at: http://localhost:8088/game-launcher.html
echo.
echo Opening browser to the visual launcher...
start "" "http://localhost:8088/game-launcher.html"
set initial=game-launcher.html
goto :runserver

:startgame
echo.
echo Starting %gamename% Web Server...
echo.
echo Server will be available at: http://localhost:8088/%game%
echo.
echo Opening browser...
start "" "http://localhost:8088/%game%"
set initial=%game%
goto :runserver
echo.

:runserver
echo Starting PowerShell web server...
echo Press Ctrl+C to stop the server
echo.

powershell -Command "& { Add-Type -AssemblyName System.Web; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8088/'); $listener.Start(); Write-Host 'Server started at http://localhost:8088'; try { while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $localPath = $request.Url.LocalPath; if ($localPath -eq '/') { $localPath = '/index.html' }; $filePath = Join-Path (Get-Location) $localPath.TrimStart('/'); if (Test-Path $filePath -PathType Leaf) { $content = [System.IO.File]::ReadAllBytes($filePath); $response.ContentLength64 = $content.Length; $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); switch ($ext) { '.html' { $response.ContentType = 'text/html; charset=utf-8' } '.css' { $response.ContentType = 'text/css' } '.js' { $response.ContentType = 'application/javascript' } '.json' { $response.ContentType = 'application/json' } '.png' { $response.ContentType = 'image/png' } '.jpg' { $response.ContentType = 'image/jpeg' } '.jpeg' { $response.ContentType = 'image/jpeg' } '.webp' { $response.ContentType = 'image/webp' } '.gif' { $response.ContentType = 'image/gif' } '.svg' { $response.ContentType = 'image/svg+xml' } '.ico' { $response.ContentType = 'image/x-icon' } '.woff' { $response.ContentType = 'font/woff' } '.woff2' { $response.ContentType = 'font/woff2' } '.ttf' { $response.ContentType = 'font/ttf' } default { $response.ContentType = 'application/octet-stream' } }; $response.Headers.Add('Access-Control-Allow-Origin', '*'); $response.Headers.Add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); $response.Headers.Add('Access-Control-Allow-Headers', 'Content-Type, Authorization'); $response.OutputStream.Write($content, 0, $content.Length); } else { $response.StatusCode = 404; $notFound = [System.Text.Encoding]::UTF8.GetBytes('404 - File Not Found'); $response.OutputStream.Write($notFound, 0, $notFound.Length); }; $response.OutputStream.Close(); } } catch { Write-Host 'Server stopped' } finally { $listener.Stop() } }"

echo.
echo Server stopped.
pause
