const express = require('express');
const router = express.Router();
const { rateLimiter, getMetrics } = require('../../controllers/MetricsBarController');

router.get('/', rateLimiter, getMetrics);

module.exports = router;
