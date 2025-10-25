# Urban Puzzle NSD - Full-Stack Web Application

A comprehensive full-stack web application with Node.js backend, React frontend, and Python data science service.

---

## 🏁 **HACKATHON MODE (<24 HOURS)?** 

### 👉 **[START HERE](START_HERE.md)** ⭐

**Quick Links for Hackathon:**
- 📖 [START_HERE.md](START_HERE.md) - Read this first!
- ⚡ [CHEAT_SHEET.md](CHEAT_SHEET.md) - Keep open while coding
- 🎯 [HACKATHON_GUIDE.md](HACKATHON_GUIDE.md) - Complete strategy
- ⏱️ [QUICK_START.md](QUICK_START.md) - Command reference

**Ultra-Quick Start:**
```bash
./hackathon-setup.sh  # 15-minute setup
npm run dev           # Start coding!
```

**You save 6-8 hours** with this structure! Everything is ready, just add YOUR idea! 🚀

---

## Project Structure

```
urban-puzzle-nsd/
├── backend/              # Node.js Express API with MVC architecture
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Data models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration files
│   │   └── utils/        # Utility functions
│   ├── swagger/          # Swagger API documentation
│   └── tests/            # Backend tests
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── python-service/       # Python data science service
    ├── app.py            # Flask application
    ├── services/         # Data processing services
    ├── models/           # ML models
    └── utils/            # Utility functions

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn
- pip

## Installation

### 1. Install all dependencies at once
```bash
npm run install-all
```

### 2. Or install manually:

**Root:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**Python Service:**
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuration

### Backend (.env)
Create `backend/.env` file:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/urban-puzzle
PYTHON_SERVICE_URL=http://localhost:5001
CORS_ORIGIN=http://localhost:3000
```

### Python Service (.env)
Create `python-service/.env` file:
```
FLASK_PORT=5001
FLASK_ENV=development
BACKEND_URL=http://localhost:5000
```

## Running the Application

### Development Mode (All services):
```bash
npm run dev
```

### Run services individually:

**Backend:**
```bash
npm run dev:backend
```
Server runs on: http://localhost:5000
Swagger UI: http://localhost:5000/api-docs

**Frontend:**
```bash
npm run dev:frontend
```
Application runs on: http://localhost:3000

**Python Service:**
```bash
npm run dev:python
```
Service runs on: http://localhost:5001

## API Documentation

Swagger API documentation is available at:
- http://localhost:5000/api-docs

## Architecture

### Backend (Node.js/Express)
- **MVC Pattern**: Separation of concerns with Models, Views (API responses), and Controllers
- **RESTful API**: Standard HTTP methods and status codes
- **Swagger Integration**: Auto-generated API documentation
- **Python Integration**: HTTP client to communicate with Python service

### Frontend (React)
- **Component-based architecture**: Reusable UI components
- **React Hooks**: Modern state management
- **Axios**: HTTP client for API calls
- **React Router**: Client-side routing

### Python Service (Flask)
- **Flask REST API**: Lightweight Python web framework
- **Data Science Libraries**: NumPy, Pandas, Scikit-learn
- **Analysis Endpoints**: Data processing and ML model endpoints

## Key Features

- ✅ MVC Architecture (Backend)
- ✅ Swagger API Documentation
- ✅ RESTful API Design
- ✅ React Frontend with modern hooks
- ✅ Python integration for data science
- ✅ Environment-based configuration
- ✅ CORS enabled
- ✅ Error handling middleware
- ✅ Modular and scalable structure

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Building for Production

```bash
# Build frontend
npm run build

# Start backend
cd backend
npm start
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC
