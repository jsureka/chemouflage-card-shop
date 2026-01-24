#!/bin/bash

# Chemouflage Card Shop - AWS Lightsail Server Setup Script
# This script prepares your Lightsail instance for deployment

set -e

echo "🚀 Starting AWS Lightsail server setup for Chemouflage Card Shop..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
echo "🔨 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/chemouflage-card-shop
sudo chown ubuntu:ubuntu /opt/chemouflage-card-shop

# Clone repository (replace with your actual repository URL)
echo "📥 Cloning repository..."
cd /opt/chemouflage-card-shop
git clone https://github.com/TasmiaZerin1128/chemouflage-card-shop.git .

# Create logs directory
sudo mkdir -p /var/log/chemouflage
sudo chown ubuntu:ubuntu /var/log/chemouflage

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Configure Docker daemon for production
echo "⚙️ Configuring Docker for production..."
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# Restart Docker
sudo systemctl restart docker

# Create systemd service for auto-start
echo "🔄 Creating systemd service..."
sudo tee /etc/systemd/system/chemouflage-app.service > /dev/null <<EOF
[Unit]
Description=Chemouflage Card Shop Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/opt/chemouflage-card-shop
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=ubuntu
Group=docker

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl enable chemouflage-app.service

# Install certbot for SSL (Let's Encrypt)
echo "🔒 Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Setup log rotation
echo "📊 Setting up log rotation..."
sudo tee /etc/logrotate.d/chemouflage > /dev/null <<EOF
/var/log/chemouflage/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

# Create health check script
echo "🏥 Creating health check script..."
sudo tee /opt/chemouflage-card-shop/health-check.sh > /dev/null <<'EOF'
#!/bin/bash

# Chemouflage Card Shop Health Check Script

echo "🏥 Starting health checks..."

# Check if containers are running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "❌ Some containers are not running!"
    exit 1
fi

# Check API health
if ! curl -f -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend API health check failed!"
    exit 1
fi

# Check frontend
if ! curl -f -s http://localhost/health > /dev/null; then
    echo "❌ Frontend health check failed!"
    exit 1
fi

# Check MongoDB
if ! docker exec chemouflage-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "❌ MongoDB health check failed!"
    exit 1
fi

# Check Redis
if ! docker exec chemouflage-redis redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis health check failed!"
    exit 1
fi

echo "✅ All health checks passed!"
EOF

chmod +x /opt/chemouflage-card-shop/health-check.sh

# Create monitoring script
echo "📊 Creating monitoring script..."
tee /opt/chemouflage-card-shop/monitor.sh > /dev/null <<'EOF'
#!/bin/bash

# Chemouflage Card Shop Monitoring Script

echo "📊 System Monitoring Report - $(date)"
echo "========================================"

# System resources
echo "💾 System Resources:"
echo "Memory Usage: $(free -h | awk '/^Mem:/{print $3"/"$2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')"
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"

echo ""

# Docker resources
echo "🐳 Docker Resources:"
docker system df

echo ""

# Container status
echo "📦 Container Status:"
docker-compose -f /opt/chemouflage-card-shop/docker-compose.prod.yml ps

echo ""

# Application logs (last 10 lines)
echo "📝 Recent Application Logs:"
docker-compose -f /opt/chemouflage-card-shop/docker-compose.prod.yml logs --tail=10
EOF

chmod +x /opt/chemouflage-card-shop/monitor.sh

# Create backup script
echo "💾 Creating backup script..."
tee /opt/chemouflage-card-shop/backup.sh > /dev/null <<'EOF'
#!/bin/bash

# Chemouflage Card Shop Backup Script

BACKUP_DIR="/opt/backups/chemouflage"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "💾 Starting backup - $DATE"

# Backup MongoDB
docker exec chemouflage-mongodb mongodump --out /tmp/backup_$DATE
docker cp chemouflage-mongodb:/tmp/backup_$DATE $BACKUP_DIR/mongodb_$DATE
docker exec chemouflage-mongodb rm -rf /tmp/backup_$DATE

# Backup Redis
docker exec chemouflage-redis redis-cli save
docker cp chemouflage-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Compress backups
cd $BACKUP_DIR
tar -czf chemouflage_backup_$DATE.tar.gz mongodb_$DATE redis_$DATE.rdb
rm -rf mongodb_$DATE redis_$DATE.rdb

# Keep only last 7 backups
ls -t chemouflage_backup_*.tar.gz | tail -n +8 | xargs rm -f

echo "✅ Backup completed - $BACKUP_DIR/chemouflage_backup_$DATE.tar.gz"
EOF

chmod +x /opt/chemouflage-card-shop/backup.sh

# Create cron jobs
echo "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/chemouflage-card-shop/backup.sh >> /var/log/chemouflage/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "*/30 * * * * /opt/chemouflage-card-shop/health-check.sh >> /var/log/chemouflage/health.log 2>&1") | crontab -

echo ""
echo "✅ AWS Lightsail server setup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your GitHub repository secrets (see README-DEPLOYMENT.md)"
echo "2. Update the repository URL in this script"
echo "3. Set up your domain name and SSL certificate"
echo "4. Configure your environment variables"
echo "5. Run your first deployment from GitHub Actions"
echo ""
echo "🔧 Useful Commands:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Restart services: sudo systemctl restart chemouflage-app"
echo "  - Run health check: ./health-check.sh"
echo "  - Monitor system: ./monitor.sh"
echo "  - Create backup: ./backup.sh"
echo ""
echo "⚠️  IMPORTANT: Please reboot the server to ensure all changes take effect!"
EOF
