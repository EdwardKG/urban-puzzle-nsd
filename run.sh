#!/bin/bash

echo "🚀 Starting Urban Puzzle NSD Application"
echo "=========================================="
echo ""

# Kill any existing processes on our ports
echo "🧹 Cleaning up ports..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null
sleep 1

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Start Backend
echo "🔧 Starting Backend Server (Port 5000)..."
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Start Frontend
echo "🌐 Starting Frontend (Port 3000)..."
cd frontend
BROWSER=none npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
sleep 3

# Start Python Service (only if venv exists with Flask)
if [ -f "python-service/venv/bin/python3" ]; then
    echo "🐍 Starting Python Service (Port 5001)..."
    cd python-service
    source venv/bin/activate
    python3 app.py > ../logs/python.log 2>&1 &
    PYTHON_PID=$!
    cd ..
else
    echo "⚠️  Python service not started (venv not ready)"
    echo "   Run: cd python-service && source venv/bin/activate && pip install -r requirements.txt"
fi

echo ""
echo "✅ Services Started!"
echo ""
echo "📍 Access URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   Python:    http://localhost:5001"
echo ""
echo "📋 Logs:"
echo "   Backend:   tail -f logs/backend.log"
echo "   Frontend:  tail -f logs/frontend.log"
echo "   Python:    tail -f logs/python.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background jobs
wait

