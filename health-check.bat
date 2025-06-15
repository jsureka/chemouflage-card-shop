@echo off
REM Health Check Script for Chemouflage Card Shop (Windows version)
REM This is a Windows batch file version for local testing

echo Starting health checks for Chemouflage Card Shop...
echo ==================================================

REM Configuration
set BACKEND_URL=http://localhost:8000
set FRONTEND_URL=http://localhost
set MAX_RETRIES=10

echo.
echo 1. Checking Docker Containers
echo --------------------------------

REM Check if Docker is running
docker version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running or not installed
    goto :error
) else (
    echo [SUCCESS] Docker is running
)

REM Check containers
for %%c in (chemouflage-mongodb chemouflage-redis chemouflage-backend chemouflage-frontend) do (
    echo Checking container: %%c
    docker ps --filter "name=%%c" --format "table {{.Names}}\t{{.Status}}" | findstr /C:"%%c" >nul
    if errorlevel 1 (
        echo [ERROR] Container %%c is not running
        goto :error
    ) else (
        echo [SUCCESS] Container %%c is running
    )
)

echo.
echo 2. Checking Service Endpoints
echo ------------------------------

REM Check backend health endpoint
echo Checking backend health endpoint...
curl -sf --max-time 10 "%BACKEND_URL%/health" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Backend health endpoint is not responding
    goto :error
) else (
    echo [SUCCESS] Backend health endpoint is responding
)

REM Check frontend
echo Checking frontend...
curl -sf --max-time 10 "%FRONTEND_URL%" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend is not responding
    goto :error
) else (
    echo [SUCCESS] Frontend is responding
)

echo.
echo 3. Overall Status
echo =================
echo [SUCCESS] All critical health checks passed! 🎉
echo.
echo ✓ All containers are running
echo ✓ Backend API is responding
echo ✓ Frontend is responding
echo ✓ Health endpoints are working
echo.
echo Deployment appears to be successful!
echo Frontend URL: %FRONTEND_URL%
echo Backend API: %BACKEND_URL%
echo API Documentation: %BACKEND_URL%/docs
echo ==================================================
goto :end

:error
echo.
echo [ERROR] Some health checks failed! ❌
echo Please check the logs and container status.
echo You can check container logs with: docker-compose logs [service_name]
echo You can check container status with: docker-compose ps
echo ==================================================
exit /b 1

:end
echo Health check completed successfully!
exit /b 0
