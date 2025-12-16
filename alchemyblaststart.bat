@echo off
setlocal

REM Absolute path to the Alchemy Blaster game folder (contains alchemy_blaster_combat.html)
set GAME_DIR=C:\Users\Lulu\Desktop\InteractiveHandbook\Alchemy-Blast\Alchemy-Blast-main
set PORT=8089
set INDEX=alchemy_blaster_combat.html

REM Move into the game directory so the server root is correct
cd /d "%GAME_DIR%"

echo Serving "%GAME_DIR%" on http://localhost:%PORT%/%INDEX%
echo.

REM Prefer Python; fall back to py
where python >nul 2>&1
if %errorlevel%==0 (
    start "" /min python -m http.server %PORT%
    timeout /t 1 >nul
    start "" "http://localhost:%PORT%/%INDEX%"
    goto :done
)

where py >nul 2>&1
if %errorlevel%==0 (
    start "" /min py -m http.server %PORT%
    timeout /t 1 >nul
    start "" "http://localhost:%PORT%/%INDEX%"
    goto :done
)

echo Python not found. Opening file directly (may hit CORS with some browsers).
start "" "%INDEX%"

:done
echo Close this window to stop the server.
endlocal