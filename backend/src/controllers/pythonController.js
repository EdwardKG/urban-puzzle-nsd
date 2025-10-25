const pythonService = require('../services/pythonService');

class PythonController {
  async checkHealth(req, res, next) {
    try {
      const health = await pythonService.checkHealth();
      res.json({
        success: true,
        pythonService: health
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Python service is unavailable',
        error: error.message
      });
    }
  }

  async analyzeData(req, res, next) {
    try {
      const { data } = req.body;
      const analysis = await pythonService.analyzeData(data);
      
      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      next(error);
    }
  }

  async processData(req, res, next) {
    try {
      const { input } = req.body;
      const result = await pythonService.processData(input);
      
      res.json({
        success: true,
        result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PythonController();
