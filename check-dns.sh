#!/bin/bash

echo "Checking DNS configuration for Chemouflage domains..."

# Get server public IP
SERVER_IP=$(curl -s ifconfig.me)
echo "Server public IP: $SERVER_IP"

echo ""
echo "Checking DNS records:"

# Check main domain
echo "1. chemouflage.app:"
nslookup chemouflage.app
echo ""

# Check www subdomain
echo "2. www.chemouflage.app:"
nslookup www.chemouflage.app
echo ""

# Check API subdomain
echo "3. api.chemouflage.app:"
nslookup api.chemouflage.app
echo ""

echo "Expected results:"
echo "- All domains should point to: $SERVER_IP"
echo "- If they don't match, update your DNS records"

echo ""
echo "Testing HTTP connectivity..."

# Test domains
for domain in "chemouflage.app" "www.chemouflage.app" "api.chemouflage.app"; do
    echo "Testing $domain..."
    curl -I -s --connect-timeout 10 "http://$domain" | head -1 || echo "Failed to connect to $domain"
done

echo ""
echo "Checking if ports 80 and 443 are open..."
netstat -tlnp | grep :80
netstat -tlnp | grep :443
