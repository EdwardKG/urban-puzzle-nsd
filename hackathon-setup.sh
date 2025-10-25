#!/bin/bash

echo "🏁 HACKATHON QUICK START"
echo "========================"
echo ""
echo "This will get you running in ~15 minutes!"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Install it first: https://nodejs.org/"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found! Install it first: https://www.python.org/"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Root dependencies
echo "📦 [1/4] Installing root dependencies..."
npm install --silent

# Backend
echo "📦 [2/4] Installing backend dependencies..."
cd backend
npm install --silent
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created backend/.env"
fi
cd ..

# Frontend
echo "📦 [3/4] Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

# Python
echo "📦 [4/4] Setting up Python service..."
cd python-service
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || touch .env
    echo "✅ Created python-service/.env"
fi
deactivate
cd ..

echo ""
echo "✅ SETUP COMPLETE!"
echo ""
echo "🚀 Quick Start:"
echo "   ./start.sh"
echo ""
echo "📖 Need help? Check START_HERE.md"
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created python-service/.env"
fi
deactivate
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 START DEVELOPING:"
echo "   npm run dev"
echo ""
echo "🌐 ACCESS POINTS:"
echo "   Frontend:  http://localhost:3000"
echo "   Swagger:   http://localhost:5000/api-docs"
echo "   Backend:   http://localhost:5000"
echo "   Python:    http://localhost:5001"
echo ""
echo "📖 READ THIS FIRST:"
echo "   👉 HACKATHON_GUIDE.md (for <24h development)"
echo ""
echo "⏱️  TIME SAVED: ~15 minutes"
echo "⏱️  TIME LEFT: ~23h 45m to build your idea! 💪"
echo ""
