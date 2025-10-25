#!/bin/bash

echo "🚀 Urban Puzzle NSD - Quick Setup Script"
echo "=========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ Python version: $(python3 --version)"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cp .env.example .env 2>/dev/null || echo ".env already exists"
cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo ""

# Setup Python service
echo "🐍 Setting up Python service..."
cd python-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env 2>/dev/null || echo ".env already exists"
deactivate
cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application, run:"
echo "   ./start.sh"
echo ""
echo "Or manually start each service:"
echo "   Backend:  cd backend && npm start"
echo "   Frontend: cd frontend && npm start"
echo "   Python:   cd python-service && source venv/bin/activate && python app.py"
cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Run all services: npm run dev"
echo "  2. Or run individually:"
echo "     - Backend: cd backend && npm run dev"
echo "     - Frontend: cd frontend && npm start"
echo "     - Python: cd python-service && source venv/bin/activate && python app.py"
echo ""
echo "📚 Access points:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5000/api"
echo "  - Swagger Docs: http://localhost:5000/api-docs"
echo "  - Python Service: http://localhost:5001"
echo ""
echo "📖 Read SETUP_INSTRUCTIONS.md for detailed information"
