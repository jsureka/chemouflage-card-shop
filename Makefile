# Makefile for Docker operations

.PHONY: help build up down logs clean test dev prod restart

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build all Docker images"
	@echo "  up        - Start all services (production)"
	@echo "  down      - Stop all services"
	@echo "  logs      - Show logs from all services"
	@echo "  clean     - Remove all containers, images, and volumes"
	@echo "  test      - Run tests"
	@echo "  dev       - Start development environment"
	@echo "  prod      - Start production environment"
	@echo "  restart   - Restart all services"

# Build all images
build:
	docker-compose build --no-cache

# Start production environment
up:
	docker-compose up -d

# Start development environment
dev:
	docker-compose -f docker-compose.dev.yml up

# Start production environment (explicit)
prod:
	docker-compose -f docker-compose.yml up -d

# Stop all services
down:
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

# Show logs
logs:
	docker-compose logs -f

# Clean up everything
clean:
	docker-compose down -v --rmi all --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	docker system prune -af --volumes

# Run tests
test:
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit
	docker-compose -f docker-compose.test.yml down

# Restart all services
restart:
	docker-compose restart

# Update images and restart
update:
	docker-compose pull
	docker-compose up -d

# Show status
status:
	docker-compose ps
