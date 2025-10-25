const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Data
 *   description: Data management endpoints
 */

/**
 * @swagger
 * /api/data:
 *   get:
 *     summary: Get all data items
 *     tags: [Data]
 *     responses:
 *       200:
 *         description: List of data items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', dataController.getAllData);

/**
 * @swagger
 * /api/data/{id}:
 *   get:
 *     summary: Get data item by ID
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Data item ID
 *     responses:
 *       200:
 *         description: Data item details
 *       404:
 *         description: Data item not found
 */
router.get('/:id', dataController.getDataById);

/**
 * @swagger
 * /api/data:
 *   post:
 *     summary: Create new data item
 *     tags: [Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - value
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sample Data
 *               value:
 *                 type: number
 *                 example: 42
 *               description:
 *                 type: string
 *                 example: Sample description
 *     responses:
 *       201:
 *         description: Data item created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('value').isNumeric().withMessage('Value must be a number')
  ],
  validate,
  dataController.createData
);

/**
 * @swagger
 * /api/data/{id}:
 *   put:
 *     summary: Update data item
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               value:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Data item updated successfully
 *       404:
 *         description: Data item not found
 */
router.put('/:id', dataController.updateData);

/**
 * @swagger
 * /api/data/{id}:
 *   delete:
 *     summary: Delete data item
 *     tags: [Data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data item deleted successfully
 *       404:
 *         description: Data item not found
 */
router.delete('/:id', dataController.deleteData);

module.exports = router;
