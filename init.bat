@echo off
echo 🚀 Initializing Chemouflage Card Shop Docker Environment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

echo ✅ Docker is installed and running

REM Copy environment files if they don't exist
if not exist .env (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your production settings
) else (
    echo ✅ .env file already exists
)

if not exist .env.local (
    echo 📋 Creating .env.local file for development...
    copy .env.dev .env.local
) else (
    echo ✅ .env.local file already exists
)

REM Create required directories
if not exist "logs" mkdir logs
if not exist "data" mkdir data

echo 🏗️  Building Docker images...
docker-compose build

if errorlevel 1 (
    echo ❌ Failed to build Docker images
    pause
    exit /b 1
)

echo ✅ Docker images built successfully

echo.
echo 🎉 Initialization complete!
echo.
echo To start the application:
echo   Production:  start.bat
echo   Development: start-dev.bat
echo.
echo To stop the application:
echo   stop.bat
echo.
echo For more information, see DOCKER.md
echo.
pause
