@echo off

cd /d "%~dp0..\backend"

echo.
echo ========================================
echo Starting Spice Garden Django Backend
echo ========================================
echo.

if not exist "venv\Scripts\python.exe" (
    echo ERROR: Backend virtual environment not found.
    echo Expected:
    echo %CD%\venv\Scripts\python.exe
    echo.
    pause
    exit /b 1
)

echo Checking Django...
venv\Scripts\python.exe manage.py check

if errorlevel 1 (
    echo.
    echo ERROR: Django check failed.
    echo.
    pause
    exit /b 1
)

echo.
echo Starting Django server...
echo Open API: http://127.0.0.1:8000/api/menu/
echo.

venv\Scripts\python.exe manage.py runserver

pause