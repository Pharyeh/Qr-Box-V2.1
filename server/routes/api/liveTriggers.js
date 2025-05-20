const express = require('express');
const router = express.Router();
const {
  rateLimiter,
  getTriggers,
  updateTriggers
} = require('../../controllers/liveTriggersController'); // ✅ file name must match

router.get('/', rateLimiter, getTriggers);
router.post('/set', rateLimiter, updateTriggers);

module.exports = router;
