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

pushd "%~dp0"
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\serve_static.ps1" -Port 8080 -Root "%CD%" -DefaultDocument "index.html"
popd

echo.
echo Server stopped.
pause
