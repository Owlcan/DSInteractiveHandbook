@echo off
echo Starting Interactive Handbook...
echo.

REM Check if IIS Express is available (comes with Visual Studio or can be installed separately)
if exist "%ProgramFiles%\IIS Express\iisexpress.exe" (
    echo Using IIS Express to start web server...
    echo Server will be available at: http://localhost:8080
    echo.
    echo Opening browser...
    start http://localhost:8080
    echo.
    echo Press Ctrl+C to stop the server
    "%ProgramFiles%\IIS Express\iisexpress.exe" /path:"%~dp0" /port:8080
    goto :end
)

if exist "%ProgramFiles(x86)%\IIS Express\iisexpress.exe" (
    echo Using IIS Express to start web server...
    echo Server will be available at: http://localhost:8080
    echo.
    echo Opening browser...
    start http://localhost:8080
    echo.
    echo Press Ctrl+C to stop the server
    "%ProgramFiles(x86)%\IIS Express\iisexpress.exe" /path:"%~dp0" /port:8080
    goto :end
)

REM Fallback - just open the file directly (will have CORS issues but works for basic viewing)
echo No web server found. Opening files directly...
echo Note: Some features may not work due to browser security restrictions.
echo.
start diaperschooltcg.html

:end
echo.
pause
