@echo off
echo Starting Chemouflage Card Shop in Development Mode...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Start development environment
echo Starting development services...
docker-compose -f docker-compose.dev.yml up

pause
