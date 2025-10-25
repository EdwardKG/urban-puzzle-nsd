const express = require('express');
const router = express.Router();
const pythonController = require('../controllers/pythonController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Python Service
 *   description: Python data science service integration endpoints
 */

/**
 * @swagger
 * /api/python/health:
 *   get:
 *     summary: Check Python service health
 *     tags: [Python Service]
 *     responses:
 *       200:
 *         description: Python service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pythonService:
 *                   type: object
 */
router.get('/health', pythonController.checkHealth);

/**
 * @swagger
 * /api/python/analyze:
 *   post:
 *     summary: Analyze data using Python service
 *     tags: [Python Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 *     responses:
 *       200:
 *         description: Analysis results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 */
router.post(
  '/analyze',
  [
    body('data').isArray().withMessage('Data must be an array')
  ],
  validate,
  pythonController.analyzeData
);

/**
 * @swagger
 * /api/python/process:
 *   post:
 *     summary: Process data using Python service
 *     tags: [Python Service]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - input
 *             properties:
 *               input:
 *                 type: object
 *                 example: { "values": [1, 2, 3], "operation": "sum" }
 *     responses:
 *       200:
 *         description: Processing results
 */
router.post('/process', pythonController.processData);

module.exports = router;
