const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getEquityData,
  updateEquityData
} = require('../../controllers/equityController');

router.get('/', rateLimiter, getEquityData);
router.post('/update', rateLimiter, updateEquityData);

module.exports = router;
