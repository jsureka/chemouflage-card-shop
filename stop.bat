@echo off
echo Stopping Chemouflage Card Shop services...

REM Stop production services
echo Stopping production services...
docker-compose down

REM Stop development services
echo Stopping development services...
docker-compose -f docker-compose.dev.yml down

echo All services stopped.
pause
