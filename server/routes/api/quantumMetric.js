const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getQuantumMetrics,
  updateQuantumMetrics
} = require('../../controllers/quantumMetricController');

router.get('/', rateLimiter, getQuantumMetrics);
router.post('/update', rateLimiter, updateQuantumMetrics);

module.exports = router;
