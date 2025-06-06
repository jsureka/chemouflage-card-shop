# Docker & CI/CD Setup for Chemouflage Card Shop

This document provides comprehensive information about the Docker and CI/CD setup for the Chemouflage Card Shop application.

## 🏗️ Architecture

The application consists of three main services:

- **Frontend**: React/Vite application served by Nginx
- **Backend**: FastAPI application with Python
- **Database**: MongoDB with Redis for caching

## 📁 Docker Files Overview

### Production Files

- `Dockerfile` - Frontend production build
- `backend/Dockerfile` - Backend production build
- `docker-compose.yml` - Production environment setup
- `nginx.conf` - Nginx configuration for frontend

### Development Files

- `Dockerfile.dev` - Frontend development build
- `backend/Dockerfile.dev` - Backend development build
- `docker-compose.dev.yml` - Development environment setup

### Testing Files

- `docker-compose.test.yml` - Testing environment setup

### CI/CD Files

- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline
- `.github/workflows/deploy.yml` - Production deployment pipeline

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git (for cloning the repository)

### Windows Users (Quick Start)

```cmd
# Start production environment
start.bat

# Start development environment
start-dev.bat

# Stop all services
stop.bat

# Run health checks
health-check.bat
```

### Linux/Mac Users

```bash
# Start production environment
make up

# Start development environment
make dev

# Stop all services
make down

# Run health checks
./health-check.sh
```

## 🛠️ Detailed Usage

### Production Environment

1. **Setup Environment Variables**

   ```cmd
   copy .env.example .env
   ```

   Edit `.env` file with your production values.

2. **Start Services**

   ```cmd
   docker-compose up -d
   ```

3. **Access Applications**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Environment

1. **Setup Environment Variables**

   ```cmd
   copy .env.dev .env.local
   ```

2. **Start Development Services**

   ```cmd
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Testing

Run the complete test suite:

```cmd
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🔧 Available Commands

### Using Makefile (Linux/Mac)

```bash
make help        # Show available commands
make build       # Build all Docker images
make up          # Start production environment
make dev         # Start development environment
make down        # Stop all services
make logs        # Show logs from all services
make clean       # Remove all containers, images, and volumes
make test        # Run tests
make restart     # Restart all services
make status      # Show service status
```

### Using Docker Compose Directly

```cmd
# Production
docker-compose up -d
docker-compose down
docker-compose logs -f

# Development
docker-compose -f docker-compose.dev.yml up
docker-compose -f docker-compose.dev.yml down

# Testing
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🏥 Health Checks

All services include health checks:

- **Frontend**: HTTP check on `/health`
- **Backend**: HTTP check on `/health`
- **MongoDB**: MongoDB ping command
- **Redis**: Redis ping command

Run health checks manually:

```cmd
# Windows
health-check.bat

# Linux/Mac
./health-check.sh
```

## 🌍 Environment Variables

### Required Variables

```env
# Database
MONGODB_URL=mongodb://admin:password@mongodb:27017/chemouflage?authSource=admin
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your-password

# Backend Security
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=Chemouflage Card Shop API
```

### Optional Variables

```env
# Redis
REDIS_URL=redis://redis:6379/0

# Email (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-password

# CORS
CORS_ORIGINS=["http://localhost", "https://yourdomain.com"]
```

## 🚀 CI/CD Pipeline

### Automated Testing

- Runs on every push and pull request
- Tests both frontend and backend
- Includes linting and type checking
- Uses MongoDB service for integration tests

### Automated Deployment

- Triggers on pushes to `main` branch
- Builds and pushes Docker images to GitHub Container Registry
- Deploys to production environment
- Runs health checks after deployment
- Sends notifications on success/failure

### Pipeline Stages

1. **Test**: Lint, test, and build verification
2. **Build**: Create production Docker images
3. **Deploy**: Deploy to production environment
4. **Verify**: Run health checks and notifications

## 🔐 Security Considerations

### Production Security

- Use strong, unique passwords for all services
- Change default SECRET_KEY
- Configure proper CORS origins
- Use HTTPS in production
- Regularly update base images
- Scan images for vulnerabilities

### Network Security

- Services communicate through internal Docker network
- Only necessary ports are exposed
- Use non-root users in containers

## 📊 Monitoring and Logging

### Viewing Logs

```cmd
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Container Status

```cmd
docker-compose ps
```

### Resource Usage

```cmd
docker stats
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```cmd
   # Check what's using the port
   netstat -ano | findstr :8000

   # Kill the process or change ports in docker-compose.yml
   ```

2. **MongoDB Connection Issues**

   ```cmd
   # Check MongoDB logs
   docker-compose logs mongodb

   # Verify MongoDB is running
   docker exec -it chemouflage-mongodb mongosh
   ```

3. **Build Failures**

   ```cmd
   # Clean build (removes cache)
   docker-compose build --no-cache

   # Remove all containers and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

4. **Permission Issues (Linux/Mac)**
   ```bash
   # Make scripts executable
   chmod +x health-check.sh
   ```

### Debugging

1. **Access Container Shell**

   ```cmd
   # Backend container
   docker exec -it chemouflage-backend bash

   # Frontend container
   docker exec -it chemouflage-frontend sh

   # MongoDB container
   docker exec -it chemouflage-mongodb mongosh
   ```

2. **Check Container Logs**
   ```cmd
   docker logs chemouflage-backend
   docker logs chemouflage-frontend
   docker logs chemouflage-mongodb
   ```

## 🔄 Updates and Maintenance

### Updating Application

```cmd
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Updating Base Images

```cmd
# Pull latest base images
docker-compose pull

# Rebuild with latest images
docker-compose build --pull --no-cache
```

### Cleanup

```cmd
# Remove unused containers, networks, images
docker system prune -f

# Remove volumes (WARNING: This deletes data!)
docker-compose down -v
```

## 📈 Performance Optimization

### Production Optimizations

- Multi-stage Docker builds to reduce image size
- Nginx gzip compression enabled
- Static asset caching configured
- Health checks for proper load balancing
- Resource limits can be added to docker-compose.yml

### Development Optimizations

- Volume mounts for hot reloading
- Separate development configurations
- Debug logging enabled

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🤝 Contributing

When contributing to the Docker setup:

1. Test changes in development environment first
2. Update documentation if adding new features
3. Ensure health checks pass
4. Update CI/CD pipeline if needed
5. Test the complete deployment process

## 📞 Support

If you encounter issues with the Docker setup:

1. Check the troubleshooting section above
2. Review container logs for errors
3. Verify environment variables are set correctly
4. Ensure Docker Desktop is running and up to date
5. Check for port conflicts with other applications
