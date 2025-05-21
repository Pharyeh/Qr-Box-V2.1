const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getSentiment,
  updateSentiment,
  setSentiments
} = require('../../controllers/assetSentimentController');

/**
 * @swagger
 * tags:
 *   name: Asset Sentiment
 *   description: API endpoints for managing asset sentiment analysis
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssetSentiment:
 *       type: object
 *       properties:
 *         asset:
 *           type: string
 *           description: Asset identifier
 *         sentiment:
 *           type: number
 *           minimum: -1
 *           maximum: 1
 *           description: Sentiment score (-1 to 1, where -1 is very negative, 1 is very positive)
 *         confidence:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Confidence level of the sentiment analysis
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the sentiment was last updated
 *       required:
 *         - asset
 *         - sentiment
 */

router.use(rateLimiter);

/**
 * @swagger
 * /api/assetSentiment:
 *   get:
 *     summary: Get sentiment analysis for all assets
 *     tags: [Asset Sentiment]
 *     responses:
 *       200:
 *         description: List of asset sentiments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssetSentiment'
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.get('/', getSentiment);

/**
 * @swagger
 * /api/assetSentiment/update:
 *   post:
 *     summary: Update sentiment for a single asset
 *     tags: [Asset Sentiment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetSentiment'
 *     responses:
 *       200:
 *         description: Asset sentiment updated successfully
 *       400:
 *         description: Invalid request body
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.post('/update', updateSentiment);

/**
 * @swagger
 * /api/assetSentiment/set:
 *   post:
 *     summary: Set sentiments for multiple assets
 *     tags: [Asset Sentiment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/AssetSentiment'
 *     responses:
 *       200:
 *         description: Asset sentiments updated successfully
 *       400:
 *         description: Invalid request body
 *       429:
 *         description: Too many requests
 *       500:
 *         description: Server error
 */
router.post('/set', setSentiments);

module.exports = router;
