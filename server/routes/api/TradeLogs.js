const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  fetchLogs,
  addLog,
  deleteLog
} = require('../../controllers/tradeLogsController');

/**
 * @swagger
 * tags:
 *   name: Trade Logs
 *   description: API endpoints for managing trading logs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TradeLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the trade log
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the trade occurred
 *         type:
 *           type: string
 *           enum: [BUY, SELL]
 *           description: Type of trade
 *         asset:
 *           type: string
 *           description: Trading asset identifier
 *         price:
 *           type: number
 *           description: Price at which the trade was executed
 *         quantity:
 *           type: number
 *           description: Amount of asset traded
 *         notes:
 *           type: string
 *           description: Additional notes about the trade
 *       required:
 *         - type
 *         - asset
 *         - price
 *         - quantity
 */

/**
 * @swagger
 * /api/TradeLogs:
 *   get:
 *     summary: Retrieve all trade logs
 *     tags: [Trade Logs]
 *     responses:
 *       200:
 *         description: List of trade logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TradeLog'
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.get('/', rateLimiter, fetchLogs);

/**
 * @swagger
 * /api/TradeLogs/add:
 *   post:
 *     summary: Add a new trade log
 *     tags: [Trade Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TradeLog'
 *     responses:
 *       200:
 *         description: Trade log added successfully
 *       400:
 *         description: Invalid request body
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.post('/add', rateLimiter, addLog);

/**
 * @swagger
 * /api/TradeLogs/delete:
 *   post:
 *     summary: Delete a trade log
 *     tags: [Trade Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the trade log to delete
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: Trade log deleted successfully
 *       400:
 *         description: Invalid request body or log ID not found
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.post('/delete', rateLimiter, deleteLog);

module.exports = router;
