const express = require('express');
const router = express.Router();

const {
  rateLimiter,
  getTimeline,
  addEvent
} = require('../../controllers/ReplayTimelineController');

// Serve only phase-based replay signals
router.get('/', rateLimiter, getTimeline);

// Add new phase signal to replay timeline
router.post('/add', rateLimiter, addEvent);

module.exports = router;
