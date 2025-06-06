@echo off
echo Starting Chemouflage Card Shop with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Build and start services
echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service health
echo Checking service health...
docker-compose ps

echo.
echo Chemouflage Card Shop is starting up!
echo Frontend: http://localhost
echo Backend API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo To view logs: docker-compose logs -f
echo To stop services: docker-compose down
echo.
pause
