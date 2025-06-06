#!/bin/bash

# Health check script for backend service
set -e

# Function to check if service is healthy
check_health() {
    local service_name=$1
    local health_url=$2
    local max_attempts=30
    local attempt=1
    
    echo "Checking health of $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            echo "✅ $service_name is healthy"
            return 0
        fi
        
        echo "⏳ Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed health check after $max_attempts attempts"
    return 1
}

# Main health check function
main() {
    echo "🏥 Starting health checks..."
    
    # Check backend health
    if ! check_health "Backend API" "http://localhost:8000/health"; then
        exit 1
    fi
    
    # Check frontend health
    if ! check_health "Frontend" "http://localhost/health"; then
        exit 1
    fi
    
    # Check MongoDB health
    if ! docker exec chemouflage-mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "❌ MongoDB is not healthy"
        exit 1
    fi
    echo "✅ MongoDB is healthy"
    
    echo "🎉 All services are healthy!"
}

main "$@"
