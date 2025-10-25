const express = require('express');
const router = express.Router();

const dataRoutes = require('./dataRoutes');
const pythonRoutes = require('./pythonRoutes');

/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Welcome to Urban Puzzle NSD API
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Urban Puzzle NSD API',
    version: '1.0.0'
  });
});

// Mount routes
router.use('/data', dataRoutes);
router.use('/python', pythonRoutes);

module.exports = router;
