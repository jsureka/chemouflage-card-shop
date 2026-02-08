#!/bin/bash

# Deployment Script for Chemouflage Card Shop
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /opt/chemouflage-card-shop

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Rebuild and restart containers
echo "🔄 Rebuilding and restarting containers..."
sudo docker-compose -f docker-compose.prod.yml up -d --build --remove-orphans

# Cleanup unused images
echo "🧹 Cleaning up unused Docker images..."
sudo docker image prune -f

# Check health
echo "🏥 Running health checks..."
./health-check.sh

echo "✅ Deployment completed successfully!"
