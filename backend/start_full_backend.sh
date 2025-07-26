#!/bin/bash

# Navigate to backend directory
cd "$(dirname "$0")"

echo "====================================================="
echo "   CHEMOUFLAGE BACKEND - FULL APPLICATION"
echo "====================================================="
echo "Environment: Development"
echo "Database: MongoDB"
echo "Cache: Redis"
echo "Storage: Cloudinary"
echo "Features: Products, Orders, Quiz, Notes, Auth"
echo "====================================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with required environment variables."
    exit 1
fi

echo "✅ Environment file found"

# Load environment variables for validation
set -a
source .env
set +a

# Check if Python environment is activated
if [ -z "$VIRTUAL_ENV" ] && [ -z "$CONDA_DEFAULT_ENV" ]; then
    echo "⚠️  Warning: No Python virtual environment detected."
    echo "   Consider activating a virtual environment before running."
    echo ""
fi

# Install/update dependencies if needed
if [ "requirements.txt" -nt ".requirements_installed" ] || [ ! -f ".requirements_installed" ]; then
    echo "📦 Installing Python dependencies..."
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

# Initialize database and setup
echo "🗄️  Initializing database..."
python db_initializer.py
if [ $? -eq 0 ]; then
    echo "✅ Database initialization completed"
else
    echo "⚠️  Database initialization had issues (this may be normal if already initialized)"
fi
echo ""

echo "🚀 Starting Chemouflage FastAPI Backend..."
echo ""
echo "📋 Available Endpoints:"
echo "   🏠 Root: http://localhost:8000/"
echo "   📚 API Docs: http://localhost:8000/docs"
echo "   🔍 Redoc: http://localhost:8000/redoc"
echo "   ❤️  Health: http://localhost:8000/health"
echo ""
echo "🎯 API Routes (v1):"
echo "   🔐 Auth: http://localhost:8000/api/v1/auth/"
echo "   🛍️  Products: http://localhost:8000/api/v1/products/"
echo "   📝 Orders: http://localhost:8000/api/v1/orders/"
echo "   💳 Payments: http://localhost:8000/api/v1/payments/"
echo "   📊 Dashboard: http://localhost:8000/api/v1/dashboard/"
echo "   🎫 Premium Codes: http://localhost:8000/api/v1/premium-codes/"
echo "   ⚙️  Settings: http://localhost:8000/api/v1/settings/"
echo "   ❓ Quiz Topics: http://localhost:8000/api/v1/quiz/topics/"
echo "   📝 Quiz Questions: http://localhost:8000/api/v1/quiz/questions/"
echo "   📈 Quiz Stats: http://localhost:8000/api/v1/quiz/stats/"
echo "   📚 Notes: http://localhost:8000/api/v1/notes/"
echo "   📞 Contact: http://localhost:8000/api/v1/contact/"
echo ""
echo "🔧 Development Features:"
echo "   - Auto-reload enabled"
echo "   - Debug logging active"
echo "   - CORS enabled for frontend"
echo "   - Rate limiting active"
echo ""
echo "⏳ Starting server (this may take a moment)..."
echo ""

# Start the full FastAPI application with all features
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level info

echo ""
echo "🛑 Backend server stopped."
