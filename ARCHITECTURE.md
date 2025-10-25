# ARCHITECTURE DIAGRAM

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Urban Puzzle NSD                         │
│                    Full-Stack Web Application                    │
└─────────────────────────────────────────────────────────────────┘

┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│               │         │               │         │               │
│   FRONTEND    │◄───────►│   BACKEND     │◄───────►│    PYTHON     │
│   (React)     │  HTTP   │   (Node.js)   │  HTTP   │   (Flask)     │
│               │         │               │         │               │
│  Port: 3000   │         │  Port: 5000   │         │  Port: 5001   │
│               │         │               │         │               │
└───────────────┘         └───────────────┘         └───────────────┘
```

---

## Data Flow

```
User Request Flow:
─────────────────

1. User interacts with React Frontend
   │
   ▼
2. Frontend calls Backend API (Axios)
   │
   ▼
3. Backend receives request
   │
   ├──► If data operation: Uses DataModel
   │    └──► Returns response to Frontend
   │
   └──► If analysis needed: Calls Python Service
        │
        ▼
4. Python Service processes with NumPy/Pandas
   │
   ▼
5. Result flows back: Python → Backend → Frontend
```

---

## Backend MVC Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐                                       │
│  │   ROUTES     │  API Endpoints                        │
│  │              │  - /api/data                          │
│  │              │  - /api/python                        │
│  └──────┬───────┘                                       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ CONTROLLERS  │  Request Handlers                     │
│  │              │  - dataController                     │
│  │              │  - pythonController                   │
│  └──────┬───────┘                                       │
│         │                                                │
│         ├─────────────────┬──────────────┐              │
│         ▼                 ▼              ▼              │
│  ┌───────────┐    ┌────────────┐  ┌──────────┐        │
│  │  MODELS   │    │  SERVICES  │  │  UTILS   │        │
│  │           │    │            │  │          │        │
│  │ DataModel │    │ pythonSvc  │  │ helpers  │        │
│  └───────────┘    └────────────┘  └──────────┘        │
│                           │                             │
│                           │ HTTP Client                 │
│                           ▼                             │
│                    Python Service                       │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │         MIDDLEWARE                   │              │
│  │  - Error Handler                     │              │
│  │  - Validator                         │              │
│  │  - CORS                              │              │
│  └──────────────────────────────────────┘              │
│                                                          │
│  ┌──────────────────────────────────────┐              │
│  │         SWAGGER                      │              │
│  │  - API Documentation                 │              │
│  │  - Interactive Testing               │              │
│  └──────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

```
┌──────────────────────────────────────────────────────┐
│                FRONTEND (React)                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────┐             │
│  │         React Router               │             │
│  │  - Home Page                       │             │
│  │  - Data Management Page            │             │
│  │  - Data Analysis Page              │             │
│  └─────────────┬──────────────────────┘             │
│                │                                      │
│                ▼                                      │
│  ┌────────────────────────────────────┐             │
│  │         PAGES                      │             │
│  │  - Home.js                         │             │
│  │  - DataPage.js                     │             │
│  │  - AnalysisPage.js                 │             │
│  └─────────────┬──────────────────────┘             │
│                │                                      │
│                ▼                                      │
│  ┌────────────────────────────────────┐             │
│  │         COMPONENTS                 │             │
│  │  - Header                          │             │
│  │  - DataItem                        │             │
│  │  - DataForm                        │             │
│  │  - AnalysisResult                  │             │
│  └─────────────┬──────────────────────┘             │
│                │                                      │
│                ├────────────┬───────────┐            │
│                ▼            ▼           ▼            │
│       ┌─────────────┐  ┌────────┐  ┌────────┐      │
│       │  SERVICES   │  │ HOOKS  │  │ UTILS  │      │
│       │             │  │        │  │        │      │
│       │ api.js      │  │useFetch│  │helpers │      │
│       │ - dataService   │        │  │        │      │
│       │ - pythonService │        │  │        │      │
│       └──────┬──────┘  └────────┘  └────────┘      │
│              │                                       │
│              │ Axios HTTP Client                    │
│              ▼                                       │
│         Backend API                                 │
└──────────────────────────────────────────────────────┘
```

---

## Python Service Architecture

```
┌───────────────────────────────────────────────────┐
│          PYTHON SERVICE (Flask)                   │
├───────────────────────────────────────────────────┤
│                                                    │
│  ┌────────────────────────────────────┐          │
│  │         Flask App (app.py)         │          │
│  │                                    │          │
│  │  Routes:                           │          │
│  │  - /health                         │          │
│  │  - /api/analyze                    │          │
│  │  - /api/process                    │          │
│  │  - /api/predict                    │          │
│  └─────────────┬──────────────────────┘          │
│                │                                   │
│                ▼                                   │
│  ┌────────────────────────────────────┐          │
│  │         SERVICES                   │          │
│  │                                    │          │
│  │  ┌──────────────────────────┐     │          │
│  │  │ data_analysis.py         │     │          │
│  │  │ - Statistical analysis   │     │          │
│  │  │ - Correlation analysis   │     │          │
│  │  │ - Predictions            │     │          │
│  │  └──────────────────────────┘     │          │
│  │                                    │          │
│  │  ┌──────────────────────────┐     │          │
│  │  │ data_processing.py       │     │          │
│  │  │ - Transformations        │     │          │
│  │  │ - Normalization          │     │          │
│  │  │ - Data cleaning          │     │          │
│  │  └──────────────────────────┘     │          │
│  └────────────────────────────────────┘          │
│                                                    │
│  ┌────────────────────────────────────┐          │
│  │         LIBRARIES                  │          │
│  │  - NumPy (numerical computing)     │          │
│  │  - Pandas (data manipulation)      │          │
│  │  - Scikit-learn (ML)               │          │
│  └────────────────────────────────────┘          │
└───────────────────────────────────────────────────┘
```

---

## API Request Flow Example

### Creating Data

```
Frontend                Backend                  Database/Storage
───────                ────────                 ────────────────

User fills form
    │
    │ POST /api/data
    │ { name: "Test", value: 100 }
    ├──────────────────►
                      Receives request
                      │
                      │ Validates data
                      │ (express-validator)
                      ▼
                      dataController.createData()
                      │
                      │ Calls model
                      ▼
                      DataModel.create()
                      │
                      │ Saves data
                      ├───────────────────────► In-memory store
                      │
                      │ Returns new item
                      │
                      │ Formats response
                      │
    ◄──────────────────┤
    │ { success: true, data: {...} }
    │
Displays result
```

### Analyzing Data with Python

```
Frontend                Backend                  Python Service
───────                ────────                 ──────────────

User submits data
    │
    │ POST /api/python/analyze
    │ { data: [1,2,3,4,5] }
    ├──────────────────►
                      Receives request
                      │
                      │ Validates data
                      ▼
                      pythonController.analyzeData()
                      │
                      │ Calls service
                      ▼
                      pythonService.analyzeData()
                      │
                      │ HTTP POST
                      │ /api/analyze
                      ├───────────────────────►
                                              Receives data
                                              │
                                              │ Calls service
                                              ▼
                                              DataAnalysisService
                                              │
                                              │ NumPy/Pandas
                                              │ Calculate stats
                                              │
                      ◄───────────────────────┤
                      │ { analysis: {...} }
                      │
    ◄──────────────────┤
    │ { success: true, analysis: {...} }
    │
Displays results
(mean, median, std, etc.)
```

---

## File Structure Tree

```
urban-puzzle-nsd/
│
├── 📄 README.md
├── 📄 SETUP_INSTRUCTIONS.md
├── 📄 QUICK_START.md
├── 📄 PROJECT_SUMMARY.md
├── 📄 package.json
├── 📄 .gitignore
├── 🔧 setup.sh
│
├── 📁 backend/
│   ├── 📄 server.js
│   ├── 📄 package.json
│   ├── 📄 .env.example
│   │
│   ├── 📁 src/
│   │   ├── 📁 controllers/
│   │   │   ├── dataController.js
│   │   │   └── pythonController.js
│   │   │
│   │   ├── 📁 models/
│   │   │   └── DataModel.js
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── index.js
│   │   │   ├── dataRoutes.js
│   │   │   └── pythonRoutes.js
│   │   │
│   │   ├── 📁 services/
│   │   │   └── pythonService.js
│   │   │
│   │   ├── 📁 middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   │
│   │   └── 📁 utils/
│   │       └── helpers.js
│   │
│   ├── 📁 swagger/
│   │   └── swagger.js
│   │
│   └── 📁 tests/
│
├── 📁 frontend/
│   ├── 📄 package.json
│   │
│   ├── 📁 public/
│   │   └── index.html
│   │
│   └── 📁 src/
│       ├── 📄 index.js
│       ├── 📄 App.js
│       ├── 📄 App.css
│       ├── 📄 index.css
│       │
│       ├── 📁 components/
│       │   ├── Header.js
│       │   ├── DataItem.js
│       │   ├── DataForm.js
│       │   └── AnalysisResult.js
│       │
│       ├── 📁 pages/
│       │   ├── Home.js
│       │   ├── DataPage.js
│       │   └── AnalysisPage.js
│       │
│       ├── 📁 services/
│       │   └── api.js
│       │
│       └── 📁 hooks/
│           └── useFetch.js
│
└── 📁 python-service/
    ├── 📄 app.py
    ├── 📄 requirements.txt
    ├── 📄 .env.example
    ├── 📄 README.md
    │
    ├── 📁 services/
    │   ├── data_analysis.py
    │   └── data_processing.py
    │
    ├── 📁 utils/
    │   └── helpers.py
    │
    └── 📁 tests/
```

---

## Technology Stack Diagram

```
┌──────────────────────────────────────────────────────┐
│                   TECHNOLOGY STACK                    │
└──────────────────────────────────────────────────────┘

Frontend Layer
─────────────────────────────────────────────────────
│ React 18          │ UI Library                      │
│ React Router      │ Client-side routing             │
│ Axios             │ HTTP client                     │
│ CSS3              │ Styling                         │
─────────────────────────────────────────────────────

Backend Layer
─────────────────────────────────────────────────────
│ Node.js           │ Runtime environment             │
│ Express.js        │ Web framework                   │
│ Swagger           │ API documentation               │
│ Axios             │ HTTP client                     │
│ Express-validator │ Input validation                │
│ CORS              │ Cross-origin support            │
│ Helmet            │ Security headers                │
│ Morgan            │ Logging                         │
─────────────────────────────────────────────────────

Python Layer
─────────────────────────────────────────────────────
│ Flask             │ Web framework                   │
│ NumPy             │ Numerical computing             │
│ Pandas            │ Data manipulation               │
│ Scikit-learn      │ Machine learning                │
│ Flask-CORS        │ Cross-origin support            │
─────────────────────────────────────────────────────

Development Tools
─────────────────────────────────────────────────────
│ Nodemon           │ Auto-restart (backend)          │
│ Concurrently      │ Run multiple services           │
│ Jest              │ Testing framework               │
─────────────────────────────────────────────────────
```

---

## Deployment Architecture (Future)

```
                    ┌────────────────┐
                    │   Load         │
                    │   Balancer     │
                    └────────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Frontend    │    │   Backend     │    │    Python     │
│   Container   │    │   Container   │    │   Container   │
│   (Nginx)     │    │   (Node.js)   │    │   (Flask)     │
└───────────────┘    └───────┬───────┘    └───────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   Database     │
                    │ (MongoDB/SQL)  │
                    └────────────────┘
```

---

## Summary

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Scalable structure
- ✅ Easy to test
- ✅ Well-documented
- ✅ Production-ready foundation

Ready to build amazing features! 🚀
