const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getTriggers,
  updateTriggers
} = require('../../controllers/liveTriggersController'); // ✅ file name must match

/**
 * @swagger
 * tags:
 *   name: Live Triggers
 *   description: API endpoints for managing real-time trading triggers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Trigger:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the trigger
 *         asset:
 *           type: string
 *           description: Asset to monitor
 *         condition:
 *           type: string
 *           enum: [ABOVE, BELOW, CROSSES_ABOVE, CROSSES_BELOW]
 *           description: Trigger condition type
 *         value:
 *           type: number
 *           description: Value to compare against
 *         active:
 *           type: boolean
 *           description: Whether the trigger is currently active
 *         action:
 *           type: string
 *           enum: [ALERT, BUY, SELL]
 *           description: Action to take when triggered
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the trigger was created
 *       required:
 *         - asset
 *         - condition
 *         - value
 *         - action
 */

/**
 * @swagger
 * /api/liveTriggers:
 *   get:
 *     summary: Get all active triggers
 *     tags: [Live Triggers]
 *     responses:
 *       200:
 *         description: List of active triggers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trigger'
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.get('/', rateLimiter, getTriggers);

/**
 * @swagger
 * /api/liveTriggers/set:
 *   post:
 *     summary: Update or create multiple triggers
 *     tags: [Live Triggers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Trigger'
 *     responses:
 *       200:
 *         description: Triggers updated successfully
 *       400:
 *         description: Invalid request body
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.post('/set', rateLimiter, updateTriggers);

module.exports = router;
