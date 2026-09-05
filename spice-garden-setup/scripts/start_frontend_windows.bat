@echo off

cd /d "%~dp0..\frontend"

echo.
echo ========================================
echo Starting Spice Garden React Frontend
echo ========================================
echo.

if not exist "package.json" (
    echo ERROR: frontend package.json not found.
    echo Expected:
    echo %CD%\package.json
    echo.
    pause
    exit /b 1
)

npm run dev

pause