const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getDecay,
  addSignal,
  resetSignals
} = require('../../controllers/edgeDecayTrackerController');

router.get('/', rateLimiter, getDecay);
router.post('/add', rateLimiter, addSignal);
router.post('/reset', rateLimiter, resetSignals);

module.exports = router;
