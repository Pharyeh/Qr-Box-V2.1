const express = require('express');
const router = express.Router();
const { rateLimiter, getHeatmapData } = require('../../controllers/SentimentHeatmapController');

router.get('/', rateLimiter, getHeatmapData);

module.exports = router;
