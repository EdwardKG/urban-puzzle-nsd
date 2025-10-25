from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime

from services.data_analysis import DataAnalysisService
from services.data_processing import DataProcessingService

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv('BACKEND_URL', 'http://localhost:5000'))

# Initialize services
analysis_service = DataAnalysisService()
processing_service = DataProcessingService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Python Data Science Service',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    """
    Analyze numerical data
    Expected input: { "data": [1, 2, 3, 4, 5] }
    """
    try:
        data = request.json.get('data')
        
        if not data or not isinstance(data, list):
            return jsonify({
                'success': False,
                'error': 'Data must be a non-empty array'
            }), 400
        
        # Perform analysis
        result = analysis_service.analyze(data)
        
        return jsonify({
            'success': True,
            'analysis': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/process', methods=['POST'])
def process_data():
    """
    Process data with custom operations
    Expected input: { "input": { "values": [1, 2, 3], "operation": "sum" } }
    """
    try:
        input_data = request.json.get('input')
        
        if not input_data:
            return jsonify({
                'success': False,
                'error': 'Input data is required'
            }), 400
        
        # Process data
        result = processing_service.process(input_data)
        
        return jsonify({
            'success': True,
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Make predictions using ML model
    Expected input: { "features": [[1, 2], [3, 4]] }
    """
    try:
        features = request.json.get('features')
        
        if not features:
            return jsonify({
                'success': False,
                'error': 'Features are required'
            }), 400
        
        # Make predictions (placeholder - add your ML model here)
        predictions = analysis_service.predict(features)
        
        return jsonify({
            'success': True,
            'predictions': predictions
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f'🐍 Python Data Science Service starting on port {port}')
    print(f'🏥 Health check: http://localhost:{port}/health')
    
    app.run(host='0.0.0.0', port=port, debug=debug)
