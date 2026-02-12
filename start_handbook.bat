@echo off
setlocal

pushd "%~dp0"

REM Stop any existing server already listening on 8088 (prevents duplicates)
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$port=8088; $conns=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue; if($conns){ $pids=$conns.OwningProcess | Sort-Object -Unique; foreach($pid in $pids){ Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } }; Get-CimInstance Win32_Process -Filter \"Name='powershell.exe' or Name='pwsh.exe'\" | Where-Object { $_.CommandLine -match 'serve_static\\.ps1' } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }" >nul 2>nul

echo.
echo Starting Interactive Handbook Web Server...
echo.
echo Server will be available at: http://localhost:8088/src/simple-handbook.html
echo.
echo Opening browser to the handbook...
start "" "http://localhost:8088/src/simple-handbook.html"
set initial=src/simple-handbook.html
goto :runserver

:runserver
echo Starting PowerShell web server...
echo Press Ctrl+C to stop the server
echo.

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve_static.ps1" -Port 8088 -Root "%CD%" -DefaultDocument "index.html"

echo.
echo Server stopped.
pause

popd
