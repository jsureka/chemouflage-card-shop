#!/bin/bash

# Deployment Script for Chemouflage Card Shop
# Includes Environment Validation and Health Checks
# Usage: ./deploy.sh

set -e

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost"
MAX_RETRIES=12
RETRY_INTERVAL=5

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting Chemouflage Deployment...${NC}"

# --- 1. Environment Validation ---
echo -e "\n${YELLOW}🔍 Validating environment...${NC}"
REQUIRED_VARS=("MONGODB_URL" "REDIS_URL" "SECRET_KEY" "BACKEND_URL" "FRONTEND_URL")
if [ -f .env ]; then
    set -a; source .env; set +a
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then MISSING_VARS+=("$var"); fi
    done
    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required vars: ${MISSING_VARS[*]}${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Environment variables OK${NC}"
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# --- 2. Deployment ---
echo -e "\n${YELLOW}📥 Pulling latest changes...${NC}"
cd /opt/chemouflage-card-shop || exit 1
git pull origin main

echo -e "\n${YELLOW}🔄 Rebuilding containers...${NC}"
sudo docker-compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo -e "\n${YELLOW}🧹 Cleaning up unused images...${NC}"
sudo docker image prune -f

# --- 3. Health Checks ---
echo -e "\n${YELLOW}🏥 Running health checks...${NC}"

check_url() {
    local url=$1
    local name=$2
    printf "   Checking %-15s " "$name..."
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
            return 0
        fi
        sleep $RETRY_INTERVAL
    done
    echo -e "${RED}FAILED${NC}"
    return 1
}

# Check Containers
if sudo docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "   Containers:\t\t${GREEN}OK${NC}"
else
    echo -e "   Containers:\t\t${RED}FAILED${NC}"
    exit 1
fi

# Check Endpoints
check_url "$BACKEND_URL/health" "Backend" || exit 1
check_url "$FRONTEND_URL" "Frontend" || exit 1

# Check Mongo/Redis via Docker
if sudo docker exec chemouflage-mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
    echo -e "   MongoDB:\t\t${GREEN}OK${NC}"
else
    echo -e "   MongoDB:\t\t${RED}FAILED${NC}"
    exit 1
fi

if sudo docker exec chemouflage-redis redis-cli ping >/dev/null 2>&1; then
    echo -e "   Redis:\t\t${GREEN}OK${NC}"
else
    echo -e "   Redis:\t\t${RED}FAILED${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Deployment Completed Successfully!${NC}"
