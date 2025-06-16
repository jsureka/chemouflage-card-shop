#!/bin/bash

# Setup SSL certificates for Chemouflage domains
# Run this script on your server to obtain SSL certificates

echo "Setting up SSL certificates for Chemouflage domains..."

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# Create certbot directory
sudo mkdir -p /var/www/certbot

# Make sure nginx is using the temporary config first
echo "Make sure you're using nginx-temp.conf before running this script!"
echo "cp nginx-temp.conf nginx.conf && docker-compose -f docker-compose.prod.yml restart frontend"
read -p "Press Enter to continue after confirming nginx is running with HTTP-only config..."

# Test if domains are accessible via HTTP first
echo "Testing domain accessibility..."
for domain in "chemouflage.app" "www.chemouflage.app" "api.chemouflage.app"; do
    echo "Testing $domain..."
    if curl -s -o /dev/null -w "%{http_code}" "http://$domain" | grep -q "200\|301\|302"; then
        echo "✓ $domain is accessible"
    else
        echo "✗ $domain is NOT accessible - please check DNS and nginx config"
        exit 1
    fi
done

# Get certificate for main domain (chemouflage.app)
echo "Obtaining certificate for chemouflage.app..."
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d chemouflage.app \
    -d www.chemouflage.app \
    --email jiteshsureka@gmail.com \
    --agree-tos \
    --non-interactive

# Get certificate for API domain (api.chemouflage.app)  
echo "Obtaining certificate for api.chemouflage.app..."
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d api.chemouflage.app \
    --email jiteshsureka@gmail.com \
    --agree-tos \
    --non-interactive

# Set proper permissions
sudo chmod -R 644 /etc/letsencrypt/live/
sudo chmod -R 644 /etc/letsencrypt/archive/
sudo chmod 600 /etc/letsencrypt/live/*/privkey.pem
sudo chmod 600 /etc/letsencrypt/archive/*/privkey*.pem

# Start nginx container
echo "Starting nginx container..."
docker-compose -f docker-compose.prod.yml up -d frontend

echo "SSL certificates setup complete!"
echo "Your certificates are located at:"
echo "  - /etc/letsencrypt/live/chemouflage.app/"
echo "  - /etc/letsencrypt/live/api.chemouflage.app/"

# Setup auto-renewal
echo "Setting up certificate auto-renewal..."
sudo crontab -l | grep -q 'certbot renew' || (sudo crontab -l; echo "0 3 * * * certbot renew --quiet && docker-compose -f $(pwd)/docker-compose.prod.yml restart frontend") | sudo crontab -
