const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getSentiment,
  updateSentiment,
  setSentiments
} = require('../../controllers/assetSentimentController');

router.use(rateLimiter);

// GET /api/assetSentiment
router.get('/', getSentiment);

// POST /api/assetSentiment/update
router.post('/update', updateSentiment);

// POST /api/assetSentiment/set
router.post('/set', setSentiments);

module.exports = router;
