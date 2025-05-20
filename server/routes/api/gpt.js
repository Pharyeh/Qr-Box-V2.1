const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getThesis,
  updateThesis
} = require('../../controllers/gptController');

router.get('/', rateLimiter, getThesis);
router.post('/update', rateLimiter, updateThesis);

module.exports = router;
