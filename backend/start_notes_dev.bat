@echo off
setlocal enabledelayedexpansion

REM Navigate to backend directory
cd /d "%~dp0"

echo Starting Chemouflage Backend with Note Management...
echo Environment: Development
echo Database: MongoDB
echo Storage: Cloudinary
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ Error: .env file not found!
    echo Please create a .env file with required environment variables.
    pause
    exit /b 1
)

echo ✅ Environment file found
echo ✅ Cloudinary configuration available
echo.

REM Check if Python environment is activated
if "%VIRTUAL_ENV%"=="" if "%CONDA_DEFAULT_ENV%"=="" (
    echo ⚠️  Warning: No Python virtual environment detected.
    echo    Consider activating a virtual environment before running.
    echo.
)

REM Install dependencies if needed
if not exist ".requirements_installed" (
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
    if !errorlevel! equ 0 (
        echo. > .requirements_installed
        echo ✅ Dependencies installed successfully
    ) else (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

echo 🚀 Starting FastAPI server...
echo    - API Documentation: http://localhost:8000/docs
echo    - Note Management: http://localhost:8000/api/v1/notes
echo    - Health Check: http://localhost:8000/health
echo.

REM Start the server with auto-reload for development
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level info

pause
