# Chemouflage Card Shop

## Overview

A modern, full-stack e-commerce application for trading cards, featuring a React frontend, FastAPI backend, MongoDB database, and Redis caching.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
*   **Backend:** FastAPI (Python), Motor (Async MongoDB), Pydantic
*   **Database:** MongoDB
*   **Cache:** Redis
*   **Infrastructure:** Docker, Docker Compose, NGINX, AWS Lightsail

## Project Structure

*   `backend/`: FastAPI application code
*   `src/`: React frontend code
*   `deploy.sh`: **Main deployment and maintenance script**
*   `docker-compose.prod.yml`: Production orchestration
*   `docker-compose.dev.yml`: Development orchestration
*   `Dockerfile`: Production frontend build
*   `Dockerfile.dev`: Development frontend build

## Quick Start (Development)

1.  **Clone the repo:**
    ```bash
    git clone <repo-url>
    cd chemouflage-card-shop
    ```

2.  **Start Dev Environment:**
    ```bash
    docker-compose -f docker-compose.dev.yml up -d --build
    ```
    *   Frontend: http://localhost:8080
    *   Backend: http://localhost:8000
    *   API Docs: http://localhost:8000/docs

## Production Deployment (AWS Lightsail)

### 1. Initial Server Setup (One-time)

SSH into your Ubuntu instance and install Docker & Docker Compose:

```bash
# Update & Install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install -y docker-compose-plugin
```

### 2. Configuration (`.env`)

Create a `.env` file in the root directory. See `.env.example` for required variables.
Key variables: `MONGODB_URL`, `REDIS_URL`, `SECRET_KEY`, `BACKEND_URL`, `FRONTEND_URL`.

### 3. Deployment

We use a single script for deployment, updates, and health checks:

```bash
./deploy.sh
```

This script will:
1.  Pull the latest code from `main`
2.  Validates environment variables
3.  Rebuilds and restarts containers
4.  Prunes unused Docker images
5.  Performs health checks on all services

### 4. SSL Setup (Certbot)

To enable HTTPS with Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
# Follow certbot instructions to generate certs for your domain
sudo certbot certonly --standalone -d yourdomain.com
```

Ensure your `nginx.conf` points to the generated certificates.

## Maintenance

*   **View Logs:**
    ```bash
    docker-compose -f docker-compose.prod.yml logs -f --tail=100
    ```
*   **Check Status:**
    ```bash
    docker-compose -f docker-compose.prod.yml ps
    ```
*   **Manual Restart:**
    ```bash
    docker-compose -f docker-compose.prod.yml restart <service_name>
    ```

## Architecture Overview

The application follows a microservices-like architecture containerized with Docker:
*   **Nginx:** Reverse proxy, SSL termination, and static file serving.
*   **Frontend:** SPA handling UI, auth flows (Firebase), and e-commerce logic.
*   **Backend:** REST API handling business logic, DB interactions, and payments (AamarPay).
*   **Data:** MongoDB for persistence, Redis for caching (sessions, products).
