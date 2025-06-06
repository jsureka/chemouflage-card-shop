@echo off
echo Running health checks for Chemouflage Card Shop...

REM Function to check if a URL is responding
:check_health
set service_name=%1
set health_url=%2
set max_attempts=30
set attempt=1

echo Checking health of %service_name%...

:health_loop
curl -f -s "%health_url%" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ %service_name% is healthy
    goto :eof
)

echo ⏳ Attempt %attempt%/%max_attempts%: %service_name% not ready yet...
timeout /t 2 /nobreak >nul
set /a attempt=%attempt%+1

if %attempt% leq %max_attempts% goto health_loop

echo ❌ %service_name% failed health check after %max_attempts% attempts
exit /b 1

REM Main health check
:main
echo 🏥 Starting health checks...

REM Check backend health
call :check_health "Backend API" "http://localhost:8000/health"
if %errorlevel% neq 0 exit /b 1

REM Check frontend health
call :check_health "Frontend" "http://localhost/health"
if %errorlevel% neq 0 exit /b 1

REM Check MongoDB health
docker exec chemouflage-mongodb mongosh --eval "db.runCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MongoDB is not healthy
    exit /b 1
)
echo ✅ MongoDB is healthy

echo 🎉 All services are healthy!
goto :eof

call :main
