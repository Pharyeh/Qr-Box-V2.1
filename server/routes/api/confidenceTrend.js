const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getConfidenceTrend,
  addConfidencePoint,
  resetTrend
} = require('../../controllers/confidenceTrendController');

router.get('/', rateLimiter, getConfidenceTrend);
router.post('/update', rateLimiter, addConfidencePoint);
router.post('/reset', rateLimiter, resetTrend);

module.exports = router;
