#!/bin/bash

# Health Check Script for Chemouflage Card Shop
# This script verifies that all services are running and responding correctly

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost"
MAX_RETRIES=30
RETRY_INTERVAL=5

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
}

# Function to check if a service is responding
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    print_status "INFO" "Checking $service_name at $url..."
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -sf --max-time 10 "$url" > /dev/null 2>&1; then
            local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
            if [ "$status_code" -eq "$expected_status" ]; then
                print_status "SUCCESS" "$service_name is healthy (HTTP $status_code)"
                return 0
            else
                print_status "WARNING" "$service_name returned HTTP $status_code, expected $expected_status"
            fi
        else
            print_status "WARNING" "$service_name is not responding (attempt $i/$MAX_RETRIES)"
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            sleep $RETRY_INTERVAL
        fi
    done
    
    print_status "ERROR" "$service_name failed health check after $MAX_RETRIES attempts"
    return 1
}

# Function to check Docker container status
check_container() {
    local container_name=$1
    
    print_status "INFO" "Checking container: $container_name"
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        local status=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$container_name" | awk '{print $2}')
        print_status "SUCCESS" "Container $container_name is running ($status)"
        return 0
    else
        print_status "ERROR" "Container $container_name is not running"
        return 1
    fi
}

# Function to check Docker container health
check_container_health() {
    local container_name=$1
    
    print_status "INFO" "Checking health status of container: $container_name"
    
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "no-health-check")
    
    case $health_status in
        "healthy")
            print_status "SUCCESS" "Container $container_name is healthy"
            return 0
            ;;
        "unhealthy")
            print_status "ERROR" "Container $container_name is unhealthy"
            return 1
            ;;
        "starting")
            print_status "WARNING" "Container $container_name is still starting..."
            # Wait a bit more for starting containers
            sleep 10
            check_container_health "$container_name"
            return $?
            ;;
        "no-health-check")
            print_status "WARNING" "Container $container_name has no health check configured"
            return 0
            ;;
        *)
            print_status "WARNING" "Container $container_name health status: $health_status"
            return 0
            ;;
    esac
}

# Function to check backend API health endpoint
check_backend_health() {
    print_status "INFO" "Checking backend health endpoint..."
    
    local response=$(curl -sf --max-time 10 "$BACKEND_URL/health" 2>/dev/null || echo "")
    
    if [ -n "$response" ]; then
        # Check if response contains expected health status
        if echo "$response" | grep -q '"status":"healthy"'; then
            print_status "SUCCESS" "Backend health endpoint is healthy"
            print_status "INFO" "Backend health details: $response"
            return 0
        else
            print_status "WARNING" "Backend health endpoint responded but may have issues: $response"
            return 1
        fi
    else
        print_status "ERROR" "Backend health endpoint is not responding"
        return 1
    fi
}

# Function to check database connectivity through backend
check_database_connectivity() {
    print_status "INFO" "Checking database connectivity through backend..."
    
    # Try to hit an endpoint that would require database access
    local response=$(curl -sf --max-time 10 "$BACKEND_URL/api/v1/products?limit=1" 2>/dev/null || echo "")
    
    if [ -n "$response" ]; then
        print_status "SUCCESS" "Database connectivity is working"
        return 0
    else
        print_status "WARNING" "Database connectivity check failed or no products endpoint available"
        return 1
    fi
}

# Main health check function
main() {
    print_status "INFO" "Starting health checks for Chemouflage Card Shop..."
    echo "=================================================="
    
    local overall_status=0
    
    # Check Docker containers
    echo -e "\n${BLUE}1. Checking Docker Containers${NC}"
    echo "--------------------------------"
    
    containers=("chemouflage-mongodb" "chemouflage-redis" "chemouflage-backend" "chemouflage-frontend")
    
    for container in "${containers[@]}"; do
        if ! check_container "$container"; then
            overall_status=1
        fi
    done
    
    # Check container health status
    echo -e "\n${BLUE}2. Checking Container Health Status${NC}"
    echo "------------------------------------"
    
    for container in "${containers[@]}"; do
        if ! check_container_health "$container"; then
            overall_status=1
        fi
    done
    
    # Check service endpoints
    echo -e "\n${BLUE}3. Checking Service Endpoints${NC}"
    echo "------------------------------"
    
    # Check backend health endpoint specifically
    if ! check_backend_health; then
        overall_status=1
    fi
    
    # Check frontend
    if ! check_service "Frontend" "$FRONTEND_URL" 200; then
        overall_status=1
    fi
    
    # Check backend API root
    if ! check_service "Backend API" "$BACKEND_URL" 200; then
        overall_status=1
    fi
    
    # Check backend docs endpoint (FastAPI automatically provides this)
    if ! check_service "Backend Docs" "$BACKEND_URL/docs" 200; then
        print_status "WARNING" "Backend docs endpoint not accessible (this is not critical)"
    fi
    
    # Check database connectivity
    echo -e "\n${BLUE}4. Checking Database Connectivity${NC}"
    echo "----------------------------------"
    
    if ! check_database_connectivity; then
        print_status "WARNING" "Database connectivity check inconclusive"
    fi
    
    # Final status
    echo -e "\n${BLUE}5. Overall Health Status${NC}"
    echo "========================"
    
    if [ $overall_status -eq 0 ]; then
        print_status "SUCCESS" "All critical health checks passed! 🎉"
        echo -e "\n${GREEN}✓ MongoDB container: Running${NC}"
        echo -e "${GREEN}✓ Redis container: Running${NC}"
        echo -e "${GREEN}✓ Backend container: Running${NC}"
        echo -e "${GREEN}✓ Frontend container: Running${NC}"
        echo -e "${GREEN}✓ Backend API: Responding${NC}"
        echo -e "${GREEN}✓ Frontend: Responding${NC}"
        echo -e "${GREEN}✓ Health endpoints: Working${NC}"
        
        print_status "INFO" "Deployment appears to be successful!"
        print_status "INFO" "Frontend URL: $FRONTEND_URL"
        print_status "INFO" "Backend API: $BACKEND_URL"
        print_status "INFO" "API Documentation: $BACKEND_URL/docs"
    else
        print_status "ERROR" "Some health checks failed! ❌"
        print_status "ERROR" "Please check the logs and container status."
        print_status "INFO" "You can check container logs with: docker-compose logs [service_name]"
        print_status "INFO" "You can check container status with: docker-compose ps"
    fi
    
    echo "=================================================="
    
    exit $overall_status
}

# Run the main function
main "$@"
