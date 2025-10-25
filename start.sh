#!/bin/bash

echo "🚀 Starting Urban Puzzle NSD Application"
echo "=========================================="
echo ""

# Exit on error for setup checks
set -e

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

# Check if python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ python3 not found. Please install Python"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 Dependencies not found. Installing..."
    npm install
    cd backend && npm install && cd ..
    cd frontend && npm install && cd ..
fi

if [ ! -d "python-service/venv" ]; then
    echo "🐍 Setting up Python virtual environment..."
    cd python-service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    cd ..
fi

echo "✅ All dependencies installed"
echo ""

# Turn off exit on error for running services
set +e

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID $PYTHON_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID $PYTHON_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup INT TERM

# Start Backend Server
echo "🔧 Starting Backend Server (Port 5000)..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start Python Service
echo "🐍 Starting Python Service (Port 5001)..."
cd python-service
source venv/bin/activate
python3 app.py &
PYTHON_PID=$!
cd ..

# Give python service time to start
sleep 2

# Start Frontend
echo "🌐 Starting Frontend (Port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Service URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   Python:    http://localhost:5001"
echo ""
echo "📋 Process IDs:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Python PID:   $PYTHON_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all processes
wait

