# Python Data Science Service

Flask-based microservice for data analysis and machine learning operations.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Run the service:
```bash
python app.py
```

The service will start on http://localhost:5001

## API Endpoints

### Health Check
- **GET** `/health`
- Returns service status

### Data Analysis
- **POST** `/api/analyze`
- Body: `{ "data": [1, 2, 3, 4, 5] }`
- Returns statistical analysis

### Data Processing
- **POST** `/api/process`
- Body: `{ "input": { "values": [1, 2, 3], "operation": "sum" } }`
- Supported operations: sum, mean, product, normalize, standardize, cumsum, diff

### Predictions
- **POST** `/api/predict`
- Body: `{ "features": [[1, 2], [3, 4]] }`
- Returns predictions

## Integration with Node.js Backend

The Python service is called from Node.js backend via HTTP requests.
See `backend/src/services/pythonService.js` for integration examples.
