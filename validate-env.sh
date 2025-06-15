#!/bin/bash

# Environment Validation Script for Chemouflage Card Shop
# This script validates that all required environment variables are set

echo "🔍 Validating environment configuration..."

REQUIRED_VARS=(
    "MONGODB_URL"
    "REDIS_URL" 
    "REDIS_PASSWORD"
    "SECRET_KEY"
    "MAIL_USERNAME"
    "MAIL_PASSWORD"
    "MAIL_FROM"
    "MAIL_SERVER"
    "FRONTEND_URL"
    "BACKEND_URL"
    "AAMARPAY_STORE_ID"
    "AAMARPAY_SIGNATURE_KEY"
)

MISSING_VARS=()

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Source the .env file
set -a
source .env
set +a

# Check each required variable
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

# Report results
if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✅ All required environment variables are set!"
    echo ""
    echo "📋 Configuration Summary:"
    echo "  Database: ${MONGODB_URL%%@*}@***"
    echo "  Redis: ${REDIS_URL}"
    echo "  Frontend: ${FRONTEND_URL}"
    echo "  Backend: ${BACKEND_URL}"
    echo "  Environment: ${ENVIRONMENT:-production}"
    echo "  Mail Server: ${MAIL_SERVER}"
    echo "  Payment Gateway: $([ "$AAMARPAY_SANDBOX" = "true" ] && echo "Sandbox" || echo "Production")"
else
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi
