const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getQuantumMetrics,
  updateQuantumMetrics
} = require('../../controllers/quantumMetricController');

/**
 * @swagger
 * tags:
 *   name: Quantum Metrics
 *   description: API endpoints for quantum metrics management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QuantumMetric:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the metric
 *         value:
 *           type: number
 *           description: The quantum metric value
 *         confidence:
 *           type: number
 *           description: Confidence score of the metric
 *       required:
 *         - timestamp
 *         - value
 */

/**
 * @swagger
 * /api/quantumMetric:
 *   get:
 *     summary: Retrieve quantum metrics
 *     tags: [Quantum Metrics]
 *     responses:
 *       200:
 *         description: List of quantum metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuantumMetric'
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.get('/', rateLimiter, getQuantumMetrics);

/**
 * @swagger
 * /api/quantumMetric/update:
 *   post:
 *     summary: Update quantum metrics
 *     tags: [Quantum Metrics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuantumMetric'
 *     responses:
 *       200:
 *         description: Metrics updated successfully
 *       400:
 *         description: Invalid request body
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.post('/update', rateLimiter, updateQuantumMetrics);

module.exports = router;
