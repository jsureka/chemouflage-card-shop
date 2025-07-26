#!/bin/bash

# Navigate to backend directory
cd "$(dirname "$0")"

echo "Starting Chemouflage Backend with Note Management..."
echo "Environment: Development"
echo "Database: MongoDB"
echo "Storage: Cloudinary"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with required environment variables."
    exit 1
fi

# Load environment variables and check required ones
source .env

required_vars=("MONGODB_URL" "SECRET_KEY" "CLOUDINARY_CLOUD_NAME" "CLOUDINARY_API_KEY" "CLOUDINARY_API_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Error: Missing required environment variables:"
    printf "   - %s\n" "${missing_vars[@]}"
    echo "Please check your .env file."
    exit 1
fi

echo "✅ Environment variables validated"
echo "✅ MongoDB URL: ${MONGODB_URL}"
echo "✅ Cloudinary Cloud: ${CLOUDINARY_CLOUD_NAME}"
echo ""

# Check if Python environment is activated
if [ -z "$VIRTUAL_ENV" ] && [ -z "$CONDA_DEFAULT_ENV" ]; then
    echo "⚠️  Warning: No Python virtual environment detected."
    echo "   Consider activating a virtual environment before running."
    echo ""
fi

# Install dependencies if requirements.txt is newer than last install
if [ "requirements.txt" -nt ".requirements_installed" ] || [ ! -f ".requirements_installed" ]; then
    echo "📦 Installing/updating Python dependencies..."
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        touch .requirements_installed
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo ""
fi

echo "🚀 Starting FastAPI server..."
echo "   - API Documentation: http://localhost:8000/docs"
echo "   - Note Management: http://localhost:8000/api/v1/notes"
echo "   - Health Check: http://localhost:8000/health"
echo ""

# Start the server with auto-reload for development
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level info
