# AWS Lightsail Deployment Guide for Chemouflage Card Shop

## Overview

This guide will help you deploy the Chemouflage Card Shop application to AWS Lightsail using GitHub Actions for CI/CD.

## Prerequisites

- AWS Lightsail instance (minimum 2GB RAM, 40GB SSD recommended)
- Domain name (optional but recommended for SSL)
- GitHub repository with Actions enabled

## Step 1: AWS Lightsail Server Setup

### 1.1 Create Lightsail Instance

1. Go to AWS Lightsail console
2. Create instance with Ubuntu 22.04 LTS
3. Choose instance plan (minimum 2GB RAM recommended)
4. Create and download SSH key pair
5. Note the public IP address

### 1.2 Initial Server Configuration

1. SSH into your Lightsail instance:

   ```bash
   ssh -i your-key.pem ubuntu@YOUR_LIGHTSAIL_IP
   ```

2. Run the setup script:

   ```bash
   wget https://raw.githubusercontent.com/YOUR_USERNAME/chemouflage-card-shop/main/setup-lightsail.sh
   chmod +x setup-lightsail.sh
   ./setup-lightsail.sh
   ```

3. Reboot the server:
   ```bash
   sudo reboot
   ```

## Step 2: GitHub Repository Secrets Configuration

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### 2.1 Server Connection Secrets

```
LIGHTSAIL_HOST=YOUR_LIGHTSAIL_PUBLIC_IP
LIGHTSAIL_USER=ubuntu
LIGHTSAIL_SSH_KEY=YOUR_PRIVATE_SSH_KEY_CONTENT
LIGHTSAIL_SSH_PORT=22  # Optional, defaults to 22
```

### 2.2 Database Configuration Secrets

```
MONGODB_PASSWORD=your_secure_mongodb_password_123
REDIS_PASSWORD=your_secure_redis_password_456
```

### 2.3 Application Security Secrets

```
SECRET_KEY=your_very_long_secret_key_for_jwt_tokens_minimum_32_characters
```

### 2.4 Email Configuration Secrets

```
MAIL_USERNAME=hello@chemouflage.app
MAIL_PASSWORD=your_email_password
MAIL_FROM=hello@chemouflage.app
MAIL_SERVER=mail.spacemail.com
MAIL_PORT=465
MAIL_STARTTLS=false
MAIL_SSL_TLS=true
```

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- FastAPI (Backend)
- MongoDB (Database)
- Cloudinary (Image Storage)

## Image Upload Feature

The application includes a complete image upload system:

### Backend Setup
1. Install Cloudinary dependency: `pip install cloudinary==1.36.0`
2. Add Cloudinary configuration to your `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
3. Restart your backend server

### Frontend Features
- **Image Upload Component**: Drag-and-drop or click-to-select image upload
- **File Validation**: Automatic validation for file type and size (max 5MB)
- **Image Preview**: Real-time preview of selected images
- **Cloudinary Integration**: Images are automatically uploaded to Cloudinary with optimizations
- **Product Management**: Upload images directly from the admin product management interface

### Usage
1. Navigate to the Admin Dashboard
2. Go to Product Management
3. Create or edit a product
4. Use the image upload section to add product images
5. Images are automatically optimized and stored in Cloudinary
6. The public URL is saved to the database and displayed throughout the application

### Quick Setup
Run the provided installation script:
- **Windows**: `install-image-upload.bat`
- **Linux/Mac**: `bash install-image-upload.sh`

```
FRONTEND_URL=http://YOUR_DOMAIN_OR_IP
BACKEND_URL=http://YOUR_DOMAIN_OR_IP:8000
```

### 2.6 Payment Gateway Secrets (AamarPay)

```
AAMARPAY_SANDBOX=true  # Set to false for production
AAMARPAY_STORE_ID=your_aamarpay_store_id
AAMARPAY_SIGNATURE_KEY=your_aamarpay_signature_key
```

### 2.7 Notification Secrets (Optional)

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Step 3: Domain Configuration (Optional but Recommended)

### 3.1 DNS Configuration

1. Point your domain to your Lightsail IP address
2. Create A record: `yourdomain.com` → `YOUR_LIGHTSAIL_IP`
3. Create A record: `www.yourdomain.com` → `YOUR_LIGHTSAIL_IP`

### 3.2 SSL Certificate Setup

1. SSH into your server
2. Run certbot to get SSL certificate:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```
3. Update nginx configuration to enable HTTPS (uncomment HTTPS server block in nginx.prod.conf)

## Step 4: Environment Variables Reference

Create a `.env` file on your server with the following variables:

```bash
# Database Configuration
MONGODB_URL=mongodb://admin:YOUR_MONGODB_PASSWORD@mongodb:27017/chemouflage?authSource=admin

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD
REDIS_DB=0
REDIS_POOL_MAX_CONNECTIONS=20

# Authentication
SECRET_KEY=YOUR_SECRET_KEY
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=Chemouflage Card Shop API
ENVIRONMENT=production

# Email Configuration
MAIL_USERNAME=YOUR_MAIL_USERNAME
MAIL_PASSWORD=YOUR_MAIL_PASSWORD
MAIL_FROM=YOUR_MAIL_FROM
MAIL_FROM_NAME=Chemouflage Card Shop
MAIL_SERVER=YOUR_MAIL_SERVER
MAIL_PORT=YOUR_MAIL_PORT
MAIL_STARTTLS=false
MAIL_SSL_TLS=true
USE_CREDENTIALS=true
VALIDATE_CERTS=true

# URLs
FRONTEND_URL=http://yourdomain.com
BACKEND_URL=http://yourdomain.com

# Payment Configuration
AAMARPAY_SANDBOX=false
AAMARPAY_STORE_ID=YOUR_STORE_ID
AAMARPAY_SIGNATURE_KEY=YOUR_SIGNATURE_KEY

# Cache Configuration
CACHE_TTL_SECONDS=300
CACHE_TTL_PRODUCTS=600
CACHE_TTL_USER_SESSIONS=3600
```

## Step 5: Deployment Process

### 5.1 Manual Deployment

1. Push your code to the main branch
2. GitHub Actions will automatically deploy to your Lightsail server
3. Monitor the deployment in the Actions tab

### 5.2 Manual Commands (if needed)

SSH into your server and run:

```bash
cd /opt/chemouflage-card-shop
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
./health-check.sh
```

## Step 6: Monitoring and Maintenance

### 6.1 View Application Logs

```bash
cd /opt/chemouflage-card-shop
docker-compose -f docker-compose.prod.yml logs -f
```

### 6.2 Monitor System Resources

```bash
./monitor.sh
```

### 6.3 Health Checks

```bash
./health-check.sh
```

### 6.4 Backup Database

```bash
./backup.sh
```

### 6.5 Update Application

```bash
sudo systemctl restart chemouflage-app
```

## Step 7: Security Best Practices

### 7.1 Firewall Configuration

The setup script configures UFW to only allow SSH, HTTP, and HTTPS traffic.

### 7.2 Regular Updates

Set up automatic security updates:

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 7.3 Change Default Passwords

Make sure to change all default passwords in your environment configuration.

### 7.4 Enable Fail2Ban (Optional)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## Step 8: Troubleshooting

### 8.1 Common Issues

**Deployment fails with SSH connection error:**

- Check LIGHTSAIL_HOST is correct
- Verify SSH key is properly formatted (include -----BEGIN/END----- lines)
- Ensure port 22 is open in Lightsail firewall

**Services won't start:**

- Check Docker logs: `docker-compose logs`
- Verify environment variables are set correctly
- Check disk space: `df -h`

**Database connection issues:**

- Ensure MongoDB container is running
- Check MongoDB logs: `docker logs chemouflage-mongodb`
- Verify MongoDB password matches

**SSL certificate issues:**

- Ensure domain points to correct IP
- Check if port 80/443 are open
- Verify certbot installation

### 8.2 Getting Help

- Check application logs
- Run the monitoring script
- Review GitHub Actions logs
- Check server system logs: `sudo journalctl -u chemouflage-app`

## Step 9: Cost Optimization

### 9.1 Lightsail Instance Sizing

- Start with 2GB RAM instance
- Monitor resource usage with `./monitor.sh`
- Scale up if needed

### 9.2 Resource Cleanup

The deployment includes automatic cleanup of old Docker images and containers.

### 9.3 Database Optimization

- Regular backups are automated
- MongoDB indexes are created by the application
- Redis memory limit is configured

## Production Checklist

- [ ] Lightsail instance created and configured
- [ ] Domain name configured (if using)
- [ ] SSL certificate installed (if using domain)
- [ ] All GitHub secrets configured
- [ ] Environment variables set correctly
- [ ] Database passwords changed from defaults
- [ ] Email configuration tested
- [ ] Payment gateway configured for production
- [ ] Backup system tested
- [ ] Monitoring alerts configured
- [ ] Firewall rules verified
- [ ] Health checks passing

## Support

For additional support:

1. Check the application logs
2. Review the GitHub Actions workflow logs
3. Test individual components using the health check script
4. Monitor system resources

Remember to keep your secrets secure and regularly update your system and dependencies!
