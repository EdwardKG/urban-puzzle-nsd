const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

class PythonService {
  async checkHealth() {
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error(`Python service health check failed: ${error.message}`);
    }
  }

  async analyzeData(data) {
    try {
      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/api/analyze`,
        { data },
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Data analysis failed: ${error.message}`);
    }
  }

  async processData(input) {
    try {
      const response = await axios.post(
        `${PYTHON_SERVICE_URL}/api/process`,
        { input },
        { timeout: 30000 }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Data processing failed: ${error.message}`);
    }
  }
}

module.exports = new PythonService();
